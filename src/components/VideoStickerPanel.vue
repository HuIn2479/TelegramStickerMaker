<template>
  <div class="card">
    <div class="mode-toggle" :class="{ 'force-local': isForceLocal }">
      <label>
        <input type="checkbox" v-model="useLocalProcessing" :disabled="isForceLocal" />
        <span class="toggle-text">
          {{ useLocalProcessing ? '🔒 浏览器本地处理（仅GIF）' : '☁️ 服务器处理' }}
        </span>
        <span class="toggle-hint">
          {{ isForceLocal ? '📌 静态托管环境，仅支持GIF本地处理' : (useLocalProcessing ? 'GIF转静态图，不上传' : '完整视频转换') }}
        </span>
      </label>
    </div>

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
import { ref, reactive, computed, onBeforeUnmount, onMounted } from 'vue'
import UploadZone from './UploadZone.vue'
import BatchItem from './BatchItem.vue'
import { generateId, downloadFile, saveToHistory } from '@/utils/helpers'
import { usePreviewModal } from '@/composables/usePreviewModal'
import { convertVideoLocally, downloadBlob } from '@/utils/imageProcessor'
import { shouldForceLocalMode } from '@/utils/env'

const emit = defineEmits(['converted'])
const tasks = ref([])
const useLocalProcessing = ref(false)
const isForceLocal = ref(false)

// 检测环境
onMounted(() => {
  if (shouldForceLocalMode()) {
    useLocalProcessing.value = true
    isForceLocal.value = true
  }
})

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
  
  video.onloadedmetadata = () => {
    task.duration = video.duration || 0
    task.width = video.videoWidth || 0
    task.height = video.videoHeight || 0
    task.endTime = Math.min(3, task.duration)
    // 清理视频元素
    video.src = ''
    video.load()
  }
  
  video.onerror = () => {
    console.warn('Failed to load video metadata for:', task.name)
    video.src = ''
  }

  if (task.file.type === 'image/gif') {
    setTimeout(() => {
      if (task.duration === 0) {
        task.duration = 3
        task.endTime = 3
      }
    }, 500)
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
    let data
    
    if (useLocalProcessing.value) {
      // 浏览器本地处理（仅GIF）
      if (task.file.type !== 'image/gif') {
        throw new Error('本地模式仅支持 GIF，请切换到服务器模式处理视频')
      }
      data = await convertVideoLocally(task.file, task.startTime, task.endTime)
    } else {
      // 服务器处理
      const formData = new FormData()
      formData.append('video', task.file)
      formData.append('startTime', task.startTime)
      formData.append('endTime', task.endTime)

      const response = await fetch('/api/convert-video', {
        method: 'POST',
        body: formData
      })

      data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '转换失败')
      }
    }

    task.status = 'done'
    task.result = data.result
    
    // 本地处理需要更新任务的宽高信息
    if (useLocalProcessing.value && data.result.width) {
      task.width = data.result.width
      task.height = data.result.height
    }
    
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
  
  if (useLocalProcessing.value && task.result.blob) {
    // 本地处理：直接下载 Blob
    downloadBlob(task.result.blob, `${baseName}.webp`)
  } else {
    // 服务器处理：从 URL 下载
    downloadFile(task.result.url, `${baseName}.webm`)
  }
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
.mode-toggle {
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #e0f2fe;
}

.mode-toggle label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.mode-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #0088cc;
}

.toggle-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: #1a1a1a;
}

.toggle-hint {
  font-size: 0.8rem;
  color: #6b7280;
  margin-left: auto;
}

.mode-toggle.force-local {
  background: #dcfce7;
  border-color: #86efac;
}

.mode-toggle input[type="checkbox"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mode-toggle.force-local label {
  cursor: default;
}
</style>
