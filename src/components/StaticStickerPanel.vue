<template>
  <div class="panel-container">
    <!-- 上传卡片 -->
    <div class="card upload-card">
      <div class="card-header">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="card-title-group">
          <h3 class="card-title">{{ t('tabs.static') }}</h3>
          <p class="card-subtitle">PNG / WEBP / JPG → 512×512</p>
        </div>
      </div>
      <UploadZone
        icon="image"
        :text="t('upload.static.text')"
        :hint="t('upload.static.hint')"
        accept="image/png,image/webp,image/jpeg"
        @files-selected="handleFilesSelected"
      />
    </div>

    <!-- 批量处理卡片 -->
    <div v-if="hasTasks" class="card batch-card">
      <div class="card-header">
        <span class="card-title">{{ t('batch.title') }}</span>
        <span class="task-count">{{ tasks.length }} {{ t('batch.items') }}</span>
      </div>
      <div class="batch-actions">
        <button class="btn btn-primary btn-sm" @click="convertAll">{{ t('batch.convertAll') }}</button>
        <button v-show="hasDoneTasks" class="btn btn-secondary btn-sm" @click="downloadAll('png')">
          {{ t('batch.downloadAllPNG') }}
        </button>
        <button v-show="hasDoneTasks" class="btn btn-secondary btn-sm" @click="downloadAll('webp')">
          {{ t('batch.downloadAllWEBP') }}
        </button>
        <button class="btn btn-secondary btn-sm" @click="clearAll">{{ t('batch.clear') }}</button>
      </div>

      <div class="batch-list">
        <BatchItem
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          type="image"
          @convert="convertSingle"
          @download="downloadResult"
          @remove="removeTask"
          @retry="retryTask"
        />
      </div>
    </div>

    <!-- 规格说明卡片 -->
    <div class="card requirements-card">
      <div class="card-header">
        <span class="card-title">{{ t('requirements.title') }}</span>
      </div>
      <div class="req-grid">
        <div class="req-item">
          <span class="req-icon">📄</span>
          <span class="req-text">{{ t('requirements.static.format') }}</span>
        </div>
        <div class="req-item">
          <span class="req-icon">📐</span>
          <span class="req-text">{{ t('requirements.static.size') }}</span>
        </div>
        <div class="req-item">
          <span class="req-icon">🎨</span>
          <span class="req-text">{{ t('requirements.static.background') }}</span>
        </div>
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

const hasTasks = computed(() => tasks.value.length > 0)
const hasDoneTasks = computed(() => tasks.value.some(t => t.status === 'done'))
const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending'))

const handleFilesSelected = files => {
  // 过滤掉不支持的文件类型（排除 GIF 动图）
  const validFiles = files.filter(file => {
    const isValid =
      file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/jpeg' || file.type === 'image/jpg'
    return isValid
  })

  if (validFiles.length === 0) {
    alert(t('alerts.invalidFormat'))
    return
  }

  if (validFiles.length < files.length) {
    alert(t('alerts.filesFiltered', { n: files.length - validFiles.length }))
  }

  // 限制最多一次上传的文件数量
  const limits = getUploadLimits()
  const MAX_FILES = limits.maxImageFiles

  if (validFiles.length > MAX_FILES) {
    alert(t('alerts.maxFiles', { max: MAX_FILES }))
  }

  const filesToProcess = validFiles.slice(0, MAX_FILES)

  filesToProcess.forEach(file => {
    const previewUrl = URL.createObjectURL(file)
    const task = reactive({
      id: generateId(),
      file: file,
      name: file.name,
      previewUrl: previewUrl,
      width: 0,
      height: 0,
      status: 'pending',
      result: null,
      error: null
    })
    tasks.value.push(task)
    loadImageMetadata(task)
  })
}

const loadImageMetadata = task => {
  const img = new Image()
  img.onload = () => {
    task.width = img.naturalWidth
    task.height = img.naturalHeight
    // 加载完成后立即释放图片对象
    img.src = ''
  }
  img.onerror = () => {
    img.src = ''
  }
  img.src = task.previewUrl
}

const convertSingle = async taskId => {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return

  task.status = 'converting'
  task.progress = { percentage: 0, message: t('status.preparing') }

  // 订阅 WebSocket 进度更新
  const unsubscribe = websocket?.subscribe(taskId, data => {
    if (data.type === 'progress') {
      task.progress = data.progress
    } else if (data.type === 'complete') {
      task.status = 'done'
      task.result = data.result?.result || data.result
      task.progress = { percentage: 100, message: t('status.completed') }

      // 保存到历史记录
      if (task.result && task.result.png && task.result.webp) {
        saveToHistory({
          id: task.id,
          type: 'image',
          fileName: task.name.replace(/\.[^.]+$/, ''),
          preview: task.result.png.url, // 使用服务器 URL 而不是 blob URL
          width: task.width,
          height: task.height,
          size: task.file.size,
          result: {
            png: task.result.png.url,
            webp: task.result.webp.url
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
    formData.append('image', task.file)
    formData.append('taskId', taskId)

    const response = await fetch('/api/convert-image', {
      method: 'POST',
      body: formData
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || '转换失败')
    }

    // 如果没有 WebSocket，使用传统方式
    if (!websocket) {
      task.status = 'done'
      task.result = data.result

      saveToHistory({
        id: task.id,
        type: 'image',
        fileName: task.name.replace(/\.[^.]+$/, ''),
        preview: task.result.png.url, // 使用服务器 URL 而不是 blob URL
        width: task.width,
        height: task.height,
        size: task.file.size,
        result: {
          png: task.result.png.url,
          webp: task.result.webp.url
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
    // 每个任务之间延迟 100ms
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}

const downloadResult = ({ id, format }) => {
  const task = tasks.value.find(t => t.id === id)
  if (!task || !task.result) return

  const baseName = task.name.replace(/\.[^.]+$/, '')
  downloadFile(task.result[format].url, `${baseName}.${format}`)
}

const downloadAll = async format => {
  const completedTasks = tasks.value.filter(t => t.status === 'done' && t.result && t.result[format])

  if (completedTasks.length === 0) {
    return
  }

  try {
    // 准备文件列表
    const files = completedTasks
      .map(task => {
        const baseName = task.name.replace(/\.[^.]+$/, '')
        return {
          url: task.result[format].url,
          name: `${baseName}.${format}`
        }
      })
      .filter(file => file.url) // 过滤掉没有 url 的文件

    // 调用后端打包下载 API
    const response = await fetch('/api/download-batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ files })
    })

    if (!response.ok) {
      throw new Error('打包下载失败')
    }

    // 下载 ZIP 文件
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stickers-${format}-${Date.now()}.zip`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error)
    alert(t('alerts.downloadFailed'))
  }
}

const removeTask = taskId => {
  const task = tasks.value.find(t => t.id === taskId)
  if (task && task.previewUrl) {
    URL.revokeObjectURL(task.previewUrl)
  }
  tasks.value = tasks.value.filter(t => t.id !== taskId)
}

const retryTask = taskId => {
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

<style scoped></style>
