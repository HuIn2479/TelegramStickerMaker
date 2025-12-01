<template>
  <div class="card">
    <UploadZone
      icon="image"
      text="点击上传或拖拽图片（支持批量）"
      hint="PNG, WEBP, JPG（不支持 GIF）"
      accept="image/png,image/webp,image/jpeg"
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
            @click="downloadAll('png')"
          >
            全部下载 PNG
          </button>
          <button 
            v-show="hasDoneTasks" 
            class="btn btn-secondary btn-sm" 
            @click="downloadAll('webp')"
          >
            全部下载 WEBP
          </button>
          <button class="btn btn-secondary btn-sm" @click="clearAll">清空</button>
        </div>
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

    <div class="requirements">
      <h4>格式要求</h4>
      <div class="req-list">
        <span class="req-item">PNG / WEBP 格式</span>
        <span class="req-item">512×512 以内</span>
        <span class="req-item">透明背景</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount } from 'vue'
import UploadZone from './UploadZone.vue'
import BatchItem from './BatchItem.vue'
import { generateId, downloadFile, saveToHistory } from '@/utils/helpers'

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

const hasTasks = computed(() => tasks.value.length > 0)
const hasDoneTasks = computed(() => tasks.value.some(t => t.status === 'done'))
const pendingTasks = computed(() => tasks.value.filter(t => t.status === 'pending'))

const handleFilesSelected = (files) => {
  // 过滤掉不支持的文件类型（排除 GIF 动图）
  const validFiles = files.filter(file => {
    const isValid = file.type === 'image/png' || 
                    file.type === 'image/webp' || 
                    file.type === 'image/jpeg' || 
                    file.type === 'image/jpg'
    if (!isValid) {
      console.warn(`跳过不支持的文件: ${file.name} (${file.type})`)
    }
    return isValid
  })
  
  if (validFiles.length === 0) {
    alert('请上传 PNG、WEBP 或 JPG 格式的静态图片（不支持 GIF 动图）')
    return
  }
  
  if (validFiles.length < files.length) {
    alert(`已过滤掉 ${files.length - validFiles.length} 个不支持的文件（GIF/视频等）`)
  }
  
  // 限制最多一次上传 20 个文件
  const MAX_FILES = 20
  const filesToProcess = validFiles.slice(0, MAX_FILES)
  
  if (validFiles.length > MAX_FILES) {
    alert(`一次最多上传 ${MAX_FILES} 个文件，已自动选择前 ${MAX_FILES} 个`)
  }
  
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

const loadImageMetadata = (task) => {
  const img = new Image()
  img.onload = () => {
    task.width = img.naturalWidth
    task.height = img.naturalHeight
    // 加载完成后立即释放图片对象
    img.src = ''
  }
  img.onerror = () => {
    console.warn('Failed to load image metadata for:', task.name)
    img.src = ''
  }
  img.src = task.previewUrl
}

const convertSingle = async (taskId) => {
  const task = tasks.value.find(t => t.id === taskId)
  if (!task) return

  task.status = 'converting'

  try {
    // 服务器处理
    const formData = new FormData()
    formData.append('image', task.file)

    const response = await fetch('/api/convert-image', {
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
      type: 'image',
      fileName: task.name.replace(/\.[^.]+$/, ''),
      preview: task.previewUrl,
      width: task.width,
      height: task.height,
      size: task.file.size,
      result: {
        png: task.result.png.url,
        webp: task.result.webp.url
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

const downloadAll = (format) => {
  tasks.value
    .filter(t => t.status === 'done' && t.result)
    .forEach(task => downloadResult({ id: task.id, format }))
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
