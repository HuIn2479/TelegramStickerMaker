<template>
  <div class="card">
    <UploadZone
      icon="video"
      text="点击上传或拖拽视频（支持批量）"
      hint="GIF, MP4, WEBM（不支持静态图片）"
      accept="image/gif,video/mp4,video/webm,video/quicktime,video/x-msvideo"
      @files-selected="handleFilesSelected"
    />

    <div v-if="hasTasks" class="batch-container">
      <div class="batch-header">
        <span class="batch-title">转换队列</span>
        <div class="batch-actions">
          <button class="btn btn-primary btn-sm" @click="convertAll">全部转换</button>
          <button 
            v-show="hasDoneTasks" 
            class="btn btn-secondary btn-sm" 
            @click="downloadAll"
          >
            全部下载
          </button>
          <button class="btn btn-secondary btn-sm" @click="clearAll">清空</button>
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
      <h4>格式要求</h4>
      <div class="req-list">
        <span class="req-item">WEBM VP9</span>
        <span class="req-item">512×512 以内</span>
        <span class="req-item">≤3 秒</span>
        <span class="req-item">30 FPS</span>
        <span class="req-item">≤256 KB</span>
        <span class="req-item">无音轨</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import UploadZone from './UploadZone.vue'
import BatchItem from './BatchItem.vue'
import { generateId, downloadFile, saveToHistory } from '@/utils/helpers'
import { usePreviewModal } from '@/composables/usePreviewModal'

const emit = defineEmits(['converted'])
const tasks = ref([])

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
    if (!isValid) {
      console.warn(`跳过不支持的文件: ${file.name} (${file.type})`)
    }
    return isValid
  })
  
  if (validFiles.length === 0) {
    alert('请上传 GIF、MP4 或 WEBM 格式的视频文件（不支持静态图片）')
    return
  }
  
  if (validFiles.length < files.length) {
    alert(`已过滤掉 ${files.length - validFiles.length} 个不支持的文件（静态图片等）`)
  }
  
  // 限制最多一次上传 10 个视频文件
  const MAX_FILES = 10
  const filesToProcess = validFiles.slice(0, MAX_FILES)
  
  if (validFiles.length > MAX_FILES) {
    alert(`视频处理较慢，一次最多上传 ${MAX_FILES} 个文件，已自动选择前 ${MAX_FILES} 个`)
  }
  
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
      console.warn('Metadata timeout, using defaults for:', task.name)
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
    console.warn('Failed to load video metadata for:', task.name, e)
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

  try {
    // 服务器处理
    const formData = new FormData()
    formData.append('video', task.file)
    formData.append('startTime', task.startTime)
    formData.append('endTime', task.endTime)

    const response = await fetch('/api/convert-video', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '转换失败')
    }

    task.status = 'done'
    task.result = data.result
    
    // 保存到历史记录
    saveToHistory({
      id: task.id,
      type: 'video',
      fileName: task.name.replace(/\.[^.]+$/, ''),
      preview: task.previewUrl,
      duration: task.duration,
      size: task.file.size,
      result: {
        webm: task.result.url
      }
    })
    
    emit('converted')
  } catch (error) {
    task.status = 'error'
    task.error = error.message
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

const downloadAll = () => {
  tasks.value
    .filter(t => t.status === 'done' && t.result)
    .forEach(task => downloadResult({ id: task.id }))
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
