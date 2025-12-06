<template>
  <div class="card">
    <UploadZone
      icon="video"
      :text="t('upload.video.text')"
      :hint="t('upload.video.hint')"
      accept="image/gif,video/mp4,video/webm,video/quicktime,video/x-msvideo"
      @files-selected="handleFilesSelected"
    />

    <div v-if="hasTasks" class="batch-container">
      <div class="batch-header">
        <span class="batch-title">{{ t('batch.title') }}</span>
        <div class="batch-actions">
          <button class="btn btn-primary btn-sm" @click="convertAll">{{ t('batch.convertAll') }}</button>
          <button 
            v-show="hasDoneTasks" 
            class="btn btn-secondary btn-sm" 
            @click="downloadAll"
          >
            {{ t('batch.downloadAll') }}
          </button>
          <button class="btn btn-secondary btn-sm" @click="clearAll">{{ t('batch.clear') }}</button>
        </div>
      </div>
      
      <div class="batch-list">
        <BatchItem
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          type="video"
          @convert="convertSingle"
          @download="downloadResult"
          @remove="removeTask"
          @retry="retryTask"
          @preview="previewTrim"
          @update-time="updateTime"
        />
      </div>
    </div>

    <div class="requirements">
      <h4>{{ t('requirements.title') }}</h4>
      <div class="req-list">
        <span class="req-item">{{ t('requirements.video.format') }}</span>
        <span class="req-item">{{ t('requirements.video.size') }}</span>
        <span class="req-item">{{ t('requirements.video.duration') }}</span>
        <span class="req-item">{{ t('requirements.video.fps') }}</span>
        <span class="req-item">{{ t('requirements.video.fileSize') }}</span>
        <span class="req-item">{{ t('requirements.video.audio') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import UploadZone from './UploadZone.vue'
import BatchItem from './BatchItem.vue'
import { generateId, downloadFile, saveToHistory } from '@/utils/helpers'
import { usePreviewModal } from '@/composables/usePreviewModal'
import { getUploadLimits } from '@/utils/env'

const { t } = useI18n()

const emit = defineEmits(['converted'])
const tasks = ref([])

// 注入 WebSocket
const websocket = inject('websocket', null)

// 组件销毁时清理内存
onBeforeUnmount(() => {
  tasks.value.forEach(task => {
    if (task.previewUrl) {
      URL.revokeObjectURL(task.previewUrl)
    }
  })
})
const { openPreview } = usePreviewModal()

const hasTasks = computed(() => tasks.value.length > 0)
const hasDoneTasks = computed(() => tasks.value.some(t => t.status === 'done'))
const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending'))

const handleFilesSelected = (files) => {
  // 过滤掉不支持的文件类型（只允许 GIF 和视频）
  const validFiles = files.filter(file => {
    const isValid = file.type === 'image/gif' || 
                    file.type === 'video/mp4' || 
                    file.type === 'video/webm' ||
                    file.type === 'video/quicktime' || // MOV
                    file.type === 'video/x-msvideo'    // AVI
    return isValid
  })
  
  if (validFiles.length === 0) {
    alert(t('alerts.invalidVideoFormat'))
    return
  }
  
  if (validFiles.length < files.length) {
    alert(t('alerts.filesFilteredVideo', { n: files.length - validFiles.length }))
  }
  
  // 限制最多一次上传的视频文件数量
  const limits = getUploadLimits()
  const MAX_FILES = limits.maxVideoFiles
  
  if (validFiles.length > MAX_FILES) {
    alert(t('alerts.maxVideos', { max: MAX_FILES }))
  }
  
  const filesToProcess = validFiles.slice(0, MAX_FILES)
  
  filesToProcess.forEach(file => {
    const previewUrl = URL.createObjectURL(file)
    const task = reactive({
      id: generateId(),
      file: file,
      name: file.name,
      previewUrl: previewUrl,
      duration: 0,
      width: 0,
      height: 0,
      startTime: 0,
      endTime: 3,
      status: 'pending',
      result: null,
      error: null
    })
    tasks.value.push(task)
    loadVideoMetadata(task)
  })
}

const loadVideoMetadata = (task) => {
  const video = document.createElement('video')
  video.preload = 'metadata' // 只加载元数据，不加载完整视频
  video.src = task.previewUrl
  
  // 设置超时，避免无限等待
  const timeout = setTimeout(() => {
    if (task.duration === 0) {
      // 使用默认值作为回退
      task.duration = 3
      task.width = 512
      task.height = 512
      task.endTime = 3
    }
    video.src = ''
    video.load()
  }, 2000)
  
  video.onloadedmetadata = () => {
    clearTimeout(timeout)
    task.duration = video.duration || 3
    task.width = video.videoWidth || 512
    task.height = video.videoHeight || 512
    task.endTime = Math.min(3, task.duration)
    // 清理视频元素
    video.src = ''
    video.load()
  }
  
  video.onerror = (e) => {
    clearTimeout(timeout)
    // 对于 GIF，使用默认值继续
    if (task.file.type === 'image/gif') {
      task.duration = 3
      task.width = 512
      task.height = 512
      task.endTime = 3
    }
    video.src = ''
    video.load()
  }
}

const updateTime = ({ id, startTime, endTime }) => {
  const task = tasks.value.find(t => t.id === id)
  if (task) {
    if (startTime !== undefined) task.startTime = startTime
    if (endTime !== undefined) task.endTime = endTime
  }
}

const previewTrim = (taskId) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return

  openPreview({
    type: 'video',
    src: task.previewUrl,
    info: {
      width: task.width,
      height: task.height,
      size: task.file.size,
      duration: task.duration
    }
  })
}

const convertSingle = async (taskId) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return

  task.status = 'converting'
  task.progress = { percentage: 0, message: t('status.preparing') }

  // 订阅 WebSocket 进度更新
  const unsubscribe = websocket?.subscribe(taskId, (data) => {
    if (data.type === 'progress') {
      task.progress = data.progress
    } else if (data.type === 'complete') {
      task.status = 'done'
      task.result = data.result?.result || data.result
      task.progress = { percentage: 100, message: t('status.completed') }
      
      // 保存到历史记录
      if (task.result && task.result.url) {
        saveToHistory({
          id: task.id,
          type: 'video',
          fileName: task.name.replace(/\.[^.]+$/, ''),
          preview: task.result.url, // 使用服务器 URL 而不是 blob URL
          duration: task.duration,
          size: task.file.size,
          result: {
            webm: task.result.url
          }
        })
      }
      
      emit('converted')
      unsubscribe?.()
    } else if (data.type === 'error') {
      task.status = 'error'
      task.error = data.error
      unsubscribe?.()
    }
  })

  try {
    // 服务器处理
    const formData = new FormData()
    formData.append('video', task.file)
    formData.append('startTime', task.startTime)
    formData.append('endTime', task.endTime)
    formData.append('taskId', taskId)

    const response = await fetch('/api/convert-video', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || t('status.conversionFailed'))
    }
    
    // 如果没有 WebSocket，使用传统方式
    if (!websocket) {
      task.status = 'done'
      task.result = data.result
      
      saveToHistory({
        id: task.id,
        type: 'video',
        fileName: task.name.replace(/\.[^.]+$/, ''),
        preview: task.result.url, // 使用服务器 URL 而不是 blob URL
        duration: task.duration,
        size: task.file.size,
        result: {
          webm: task.result.url
        }
      })
      
      emit('converted')
    }
  } catch (error) {
    task.status = 'error'
    task.error = error.message
    unsubscribe?.()
  }
}

const convertAll = async () => {
  // 批量转换时添加延迟，避免并发过高
  for (const task of pendingTasks.value) {
    await convertSingle(task.id)
    // 视频处理耗时较长，延迟 200ms
    await new Promise(resolve => setTimeout(resolve, 200))
  }
}

const downloadResult = ({ id }) => {
  const task = tasks.value.find(t => t.id === id)
  if (!task || !task.result) return

  const baseName = task.name.replace(/\.[^.]+$/, '')
  downloadFile(task.result.url, `${baseName}.webm`)
}

const downloadAll = async () => {
  const completedTasks = tasks.value.filter(t => t.status === 'done' && t.result && t.result.url)
  
  if (completedTasks.length === 0) {
    return
  }

  try {
    // 准备文件列表
    const files = completedTasks.map(task => {
      const baseName = task.name.replace(/\.[^.]+$/, '')
      return {
        url: task.result.url,
        name: `${baseName}.webm`
      }
    }).filter(file => file.url) // 过滤掉没有 url 的文件

    // 调用后端打包下载 API
    const response = await fetch('/api/download-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ files })
    })

    if (!response.ok) {
      throw new Error(t('alerts.downloadFailed'))
    }

    // 下载 ZIP 文件
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stickers-video-${Date.now()}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
    alert(t('alerts.downloadFailed'))
  }
}

const removeTask = (taskId) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task && task.previewUrl) {
    URL.revokeObjectURL(task.previewUrl)
  }
  tasks.value = tasks.value.filter(t => t.id !== taskId)
}

const retryTask = (taskId) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task) {
    task.status = 'pending'
    task.error = null
  }
}

const clearAll = () => {
  tasks.value.forEach(task => {
    if (task.previewUrl) {
      URL.revokeObjectURL(task.previewUrl)
    }
  })
  tasks.value = []
}
</script>

<style scoped>
</style>
