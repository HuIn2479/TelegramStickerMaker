<template>
  <div class="batch-item">
    <div class="batch-item-header">
      <span class="batch-item-name" :title="task.name">{{ task.name }}</span>
      <span class="batch-item-status" :class="task.status">{{ statusText }}</span>
    </div>

    <div class="batch-item-content">
      <div class="batch-item-preview" @click="openPreview(false)">
        <!-- GIF 使用 img 标签 -->
        <img
          v-if="isGif"
          :src="isHovering ? task.previewUrl : staticPreviewUrl || task.previewUrl"
          :alt="task.name"
          @mouseenter="isHovering = true"
          @mouseleave="isHovering = false"
        />
        <!-- 视频使用 video 标签 -->
        <video
          v-else-if="type === 'video'"
          :src="task.previewUrl"
          muted
          loop
          preload="metadata"
          @mouseenter="handleMouseEnter"
          @mouseleave="handleMouseLeave"
        ></video>
        <!-- 静态图片 -->
        <img v-else :src="task.previewUrl" :alt="task.name" />
      </div>

      <div class="batch-item-controls">
        <!-- 待转换状态 -->
        <template v-if="task.status === 'pending'">
          <div class="batch-item-info">
            <span v-if="task.width && task.height" class="info-tag">{{ task.width }}×{{ task.height }}</span>
            <span v-else class="info-tag">{{ t('item.loading') }}</span>
            <span class="info-tag">{{ formatFileSize(task.file.size) }}</span>
          </div>

          <div class="batch-item-actions">
            <button class="btn btn-primary" @click="$emit('convert', task.id)">{{ t('item.convert') }}</button>
            <button class="btn btn-secondary" @click="$emit('remove', task.id)">{{ t('item.remove') }}</button>
          </div>
        </template>

        <!-- 转换中状态 -->
        <template v-if="task.status === 'converting'">
          <div class="batch-item-progress">
            <div class="progress-header">
              <span class="loading-spinner"></span>
              <span class="progress-message">{{ task.progress?.message || t('status.converting') }}</span>
              <span class="progress-percentage">{{ task.progress?.percentage || 0 }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (task.progress?.percentage || 0) + '%' }"></div>
            </div>
          </div>
        </template>

        <!-- 完成状态 -->
        <template v-if="task.status === 'done' && task.result">
          <div class="batch-item-result">
            <div style="display: flex; gap: 12px; align-items: center">
              <!-- 转换后的视频结果（包括 GIF 转换后的 WEBM） -->
              <video
                v-if="type === 'video'"
                :src="task.result.url"
                muted
                loop
                @mouseenter="handleMouseEnter"
                @mouseleave="handleMouseLeave"
                @click="openPreview(true)"
              ></video>
              <!-- 静态贴纸结果 -->
              <img v-else :src="task.result.png.url" alt="Result" @click="openPreview(true)" />

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
                    <button class="btn btn-primary" @click="$emit('download', { id: task.id })">
                      {{ t('item.download') }}
                    </button>
                  </template>
                  <template v-else>
                    <button class="btn btn-primary" @click="$emit('download', { id: task.id, format: 'png' })">
                      PNG
                    </button>
                    <button class="btn btn-secondary" @click="$emit('download', { id: task.id, format: 'webp' })">
                      WEBP
                    </button>
                  </template>
                  <button class="btn btn-secondary" @click="$emit('remove', task.id)">{{ t('item.remove') }}</button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- 错误状态 -->
        <template v-if="task.status === 'error'">
          <div class="batch-item-info">
            <span class="info-tag invalid">{{ task.error || t('status.conversionFailed') }}</span>
            <button class="btn btn-secondary btn-sm" @click="$emit('retry', task.id)">{{ t('item.retry') }}</button>
            <button class="btn btn-secondary btn-sm" @click="$emit('remove', task.id)">{{ t('item.remove') }}</button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatFileSize, getStatusText } from '@/utils/helpers'
import { usePreviewModal } from '@/composables/usePreviewModal'

const { t } = useI18n()

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

defineEmits(['convert', 'remove', 'retry', 'download', 'preview'])

const statusText = computed(() => getStatusText(props.task.status))

const isGif = computed(() => {
  return props.task.file?.type === 'image/gif'
})

const isHovering = ref(false)
const staticPreviewUrl = ref('')

const generateStaticGifPreview = () => {
  if (!props.task.previewUrl) return

  const img = new Image()
  img.src = props.task.previewUrl
  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    staticPreviewUrl.value = canvas.toDataURL('image/png')
  }
}

watch(
  () => props.task.previewUrl,
  () => {
    if (isGif.value) {
      generateStaticGifPreview()
    } else {
      staticPreviewUrl.value = ''
    }
  },
  { immediate: true }
)

const handleMouseEnter = e => {
  if (props.type === 'video') {
    e.target.play().catch(err => {
      // 忽略播放错误（可能是 blob URL 已失效）
      console.warn('视频播放失败:', err.message)
    })
  }
}

const handleMouseLeave = e => {
  if (props.type === 'video') {
    try {
      e.target.pause()
    } catch (err) {
      // 忽略暂停错误
      console.warn('视频暂停失败:', err.message)
    }
  }
}

const openPreview = (usesResult = false) => {
  let src, info, type, startTime, endTime, isGif

  if (usesResult && props.task.result) {
    // 转换完成后的预览
    src = props.type === 'video' ? props.task.result.url : props.task.result.png.url
    type = props.type
    isGif = false // 转换后已经不是 GIF
    startTime = 0
    endTime = 0
    info = {
      width: props.task.result.width,
      height: props.task.result.height,
      size: props.type === 'video' ? props.task.result.size : props.task.result.png.size,
      duration: props.type === 'video' ? props.task.result.duration : 0
    }
  } else {
    // 原始文件预览
    src = props.task.previewUrl
    isGif = props.task.file?.type === 'image/gif'
    type = isGif ? 'gif' : props.type
    startTime = props.task.startTime || 0
    endTime = props.task.endTime || 0
    info = {
      width: props.task.width,
      height: props.task.height,
      size: props.task.file.size,
      duration: props.type === 'video' ? props.task.duration : 0
    }
  }

  const { openPreview: openModal } = usePreviewModal()
  openModal({
    type,
    src,
    startTime,
    endTime,
    isGif,
    info
  })
}
</script>
