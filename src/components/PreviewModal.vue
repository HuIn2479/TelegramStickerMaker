<template>
  <Teleport to="body">
    <div v-if="state.visible" class="preview-modal" @click="handleBackdropClick">
      <div class="preview-modal-content" @click.stop>
        <button class="preview-modal-close" @click="close">✕</button>

        <!-- GIF 使用 img 标签 -->
        <img v-if="state.type === 'gif'" :src="state.src" alt="GIF Preview" />
        <!-- 视频使用 video 标签并支持时间片段 -->
        <video
          v-else-if="state.type === 'video'"
          ref="videoRef"
          :src="state.src"
          autoplay
          loop
          muted
          controls
        ></video>
        <!-- 静态图片 -->
        <img v-else :src="state.src" alt="Preview" />

        <div class="preview-modal-info">
          <span v-if="state.info.width" class="info-tag">{{ state.info.width }}×{{ state.info.height }}</span>
          <span v-if="state.info.duration" class="info-tag">{{ state.info.duration.toFixed(1) }}s</span>
          <span v-if="state.startTime > 0 || state.endTime > 0" class="info-tag">
            截取: {{ state.startTime.toFixed(1) }}s - {{ state.endTime.toFixed(1) }}s
          </span>
          <span v-if="state.info.size" class="info-tag">
            {{ formatFileSize(state.info.size) }}
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { usePreviewModal } from '@/composables/usePreviewModal'
import { formatFileSize } from '@/utils/helpers'

const { state, close } = usePreviewModal()
const videoRef = ref(null)

const handleBackdropClick = e => {
  if (e.target.classList.contains('preview-modal')) {
    close()
  }
}

const handleKeydown = e => {
  if (e.key === 'Escape' && state.visible) {
    close()
  }
}

// 监听视频元素，设置时间片段播放
watch(
  () => [state.visible, state.type],
  ([visible, type]) => {
    if (visible && type === 'video' && videoRef.value) {
      const video = videoRef.value
      
      // 设置起始时间
      if (state.startTime > 0) {
        video.currentTime = state.startTime
      }
      
      // 监听播放进度，循环播放截取片段
      const handleTimeUpdate = () => {
        if (state.endTime > 0 && video.currentTime >= state.endTime) {
          video.currentTime = state.startTime
        }
      }
      
      video.addEventListener('timeupdate', handleTimeUpdate)
      
      // 清理函数
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate)
      }
    }
  },
  { immediate: true }
)

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
