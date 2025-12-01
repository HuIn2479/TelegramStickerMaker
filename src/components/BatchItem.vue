<template>
  <div class="batch-item">
    <div class="batch-item-header">
      <span class="batch-item-name" :title="task.name">{{ task.name }}</span>
      <span class="batch-item-status" :class="task.status">{{ statusText }}</span>
    </div>
    
    <div class="batch-item-content">
      <div class="batch-item-preview" @click="openPreview(false)">
        <video 
          v-if="type === 'video'"
          :src="task.previewUrl" 
          muted 
          loop
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        />
        <img v-else :src="task.previewUrl" :alt="task.name">
      </div>
      
      <div class="batch-item-controls">
        <!-- 待转换状态 -->
        <template v-if="task.status === 'pending'">
          <!-- 视频时间截取控制 -->
          <div v-if="type === 'video'" class="trim-control">
            <div class="trim-label">
              <span>截取时间段</span>
              <span>{{ trimDuration }}s / {{ task.duration.toFixed(1) }}s</span>
            </div>
            <div class="trim-inputs">
              <div class="trim-input-group">
                <label>开始</label>
                <input 
                  type="number" 
                  :value="task.startTime.toFixed(1)" 
                  min="0" 
                  :max="task.duration" 
                  step="0.1"
                  @change="handleStartTimeChange"
                >
              </div>
              <div class="trim-input-group">
                <label>结束</label>
                <input 
                  type="number" 
                  :value="task.endTime.toFixed(1)" 
                  min="0" 
                  :max="task.duration" 
                  step="0.1"
                  @change="handleEndTimeChange"
                >
              </div>
              <div class="trim-input-group">
                <label>时长</label>
                <span class="info-tag" :class="isDurationValid ? 'valid' : 'invalid'">
                  {{ trimDuration }}s
                </span>
              </div>
            </div>
          </div>
          
          <div class="batch-item-info">
            <span v-if="task.width && task.height" class="info-tag">{{ task.width }}×{{ task.height }}</span>
            <span v-else class="info-tag">加载中...</span>
            <span class="info-tag">{{ formatFileSize(task.file.size) }}</span>
          </div>
          
          <div class="batch-item-actions">
            <button class="btn btn-primary" @click="$emit('convert', task.id)">转换</button>
            <button v-if="type === 'video'" class="btn btn-secondary" @click="$emit('preview', task.id)">预览截取</button>
            <button class="btn btn-secondary" @click="$emit('remove', task.id)">移除</button>
          </div>
        </template>
        
        <!-- 转换中状态 -->
        <template v-if="task.status === 'converting'">
          <div class="batch-item-info">
            <span class="loading-spinner"></span>
            <span style="font-size: 0.8rem; color: var(--text-secondary);">正在转换...</span>
          </div>
        </template>
        
        <!-- 完成状态 -->
        <template v-if="task.status === 'done' && task.result">
          <div class="batch-item-result">
            <div style="display: flex; gap: 12px; align-items: center;">
              <video 
                v-if="type === 'video'" 
                :src="task.result.url" 
                muted 
                loop 
                autoplay
                @click="openPreview(true)"
              />
              <img 
                v-else 
                :src="task.result.png.url" 
                alt="Result"
                @click="openPreview(true)"
              >
              
              <div>
                <div class="result-info">
                  <span class="info-tag valid">{{ task.result.width }}×{{ task.result.height }}</span>
                  <template v-if="type === 'video'">
                    <span class="info-tag valid">{{ task.result.duration.toFixed(1) }}s</span>
                    <span class="info-tag" :class="task.result.sizeValid ? 'valid' : 'warning'">
                      {{ formatFileSize(task.result.size) }}
                    </span>
                  </template>
                  <template v-else>
                    <span class="info-tag">PNG: {{ formatFileSize(task.result.png.size) }}</span>
                    <span class="info-tag">WEBP: {{ formatFileSize(task.result.webp.size) }}</span>
                  </template>
                </div>
                
                <div class="batch-item-actions">
                  <template v-if="type === 'video'">
                    <button class="btn btn-primary" @click="$emit('download', { id: task.id })">下载</button>
                  </template>
                  <template v-else>
                    <button class="btn btn-primary" @click="$emit('download', { id: task.id, format: 'png' })">PNG</button>
                    <button class="btn btn-secondary" @click="$emit('download', { id: task.id, format: 'webp' })">WEBP</button>
                  </template>
                  <button class="btn btn-secondary" @click="$emit('remove', task.id)">移除</button>
                </div>
              </div>
            </div>
          </div>
        </template>
        
        <!-- 错误状态 -->
        <template v-if="task.status === 'error'">
          <div class="batch-item-info">
            <span class="info-tag invalid">{{ task.error || '转换失败' }}</span>
            <button class="btn btn-secondary btn-sm" @click="$emit('retry', task.id)">重试</button>
            <button class="btn btn-secondary btn-sm" @click="$emit('remove', task.id)">移除</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatFileSize, getStatusText } from '@/utils/helpers'
import { usePreviewModal } from '@/composables/usePreviewModal'

const props = defineProps({
  task: {
    type: Object,
    required: true
  },
  type: {
    type: String,
    default: 'image'
  }
})

const emit = defineEmits(['convert', 'remove', 'retry', 'download', 'preview', 'updateTime'])

const statusText = computed(() => getStatusText(props.task.status))

const trimDuration = computed(() => {
  if (props.type !== 'video') return 0
  return (props.task.endTime - props.task.startTime).toFixed(1)
})

const isDurationValid = computed(() => {
  if (props.type !== 'video') return true
  return (props.task.endTime - props.task.startTime) <= 3
})

const handleStartTimeChange = (e) => {
  let value = Math.max(0, Math.min(parseFloat(e.target.value) || 0, props.task.duration))
  if (value > props.task.endTime) value = props.task.endTime
  emit('updateTime', { id: props.task.id, startTime: value })
}

const handleEndTimeChange = (e) => {
  let value = Math.max(0, Math.min(parseFloat(e.target.value) || 0, props.task.duration))
  if (value < props.task.startTime) value = props.task.startTime
  emit('updateTime', { id: props.task.id, endTime: value })
}

const handleMouseEnter = (e) => {
  if (props.type === 'video') {
    e.target.play()
  }
}

const handleMouseLeave = (e) => {
  if (props.type === 'video') {
    e.target.pause()
    e.target.currentTime = 0
  }
}

const openPreview = (usesResult = false) => {
  let src, info
  
  if (usesResult && props.task.result) {
    src = props.type === 'video' ? props.task.result.url : props.task.result.png.url
    info = {
      width: props.task.result.width,
      height: props.task.result.height,
      size: props.type === 'video' ? props.task.result.size : props.task.result.png.size,
      duration: props.type === 'video' ? props.task.result.duration : 0
    }
  } else {
    src = props.task.previewUrl
    info = {
      width: props.task.width,
      height: props.task.height,
      size: props.task.file.size,
      duration: props.type === 'video' ? props.task.duration : 0
    }
  }

  const { openPreview: openModal } = usePreviewModal()
  openModal({
    type: props.type,
    src,
    info
  })
}
</script>
