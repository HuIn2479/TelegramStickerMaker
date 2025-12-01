<template>
  <Teleport to="body">
    <div v-if="state.visible" class="preview-modal" @click="handleBackdropClick">
      <div class="preview-modal-content" @click.stop>
        <button class="preview-modal-close" @click="close">✕</button>
        
        <video 
          v-if="state.type === 'video'" 
          :src="state.src" 
          autoplay 
          loop 
          muted
          controls
        />
        <img v-else :src="state.src" alt="Preview">
        
        <div class="preview-modal-info">
          <span v-if="state.info.width" class="info-tag">
            {{ state.info.width }}×{{ state.info.height }}
          </span>
          <span v-if="state.info.duration" class="info-tag">
            {{ state.info.duration.toFixed(1) }}s
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
import { onMounted, onUnmounted } from 'vue'
import { usePreviewModal } from '@/composables/usePreviewModal'
import { formatFileSize } from '@/utils/helpers'

const { state, close } = usePreviewModal()

const handleBackdropClick = (e) => {
  if (e.target.classList.contains('preview-modal')) {
    close()
  }
}

const handleKeydown = (e) => {
  if (e.key === 'Escape' && state.visible) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>
