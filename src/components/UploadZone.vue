<template>
  <div
    class="upload-zone"
    :class="{ dragover: isDragover }"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div class="upload-content">
      <div class="upload-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path
            v-if="icon === 'image'"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            v-else
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </div>
      <p class="upload-text">{{ text }}</p>
      <p class="upload-hint">{{ hint }}</p>
    </div>
    <input
      :id="inputId"
      ref="fileInput"
      :name="inputId"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileChange"
      @click.stop
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'image'
  },
  text: {
    type: String,
    default: 'Click to upload or drag files'
  },
  hint: {
    type: String,
    default: ''
  },
  accept: {
    type: String,
    default: '*/*'
  },
  multiple: {
    type: Boolean,
    default: true
  }
})

const inputId = computed(() => `upload-input-${props.icon}`)
const emit = defineEmits(['filesSelected'])

const isDragover = ref(false)
const fileInput = ref(null)

const handleDragEnter = () => {
  isDragover.value = true
}

const handleDragLeave = () => {
  isDragover.value = false
}

const handleDrop = e => {
  isDragover.value = false
  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
    emit('filesSelected', files)
  }
}

const handleFileChange = e => {
  const files = Array.from(e.target.files)
  if (files.length > 0) {
    emit('filesSelected', files)
    e.target.value = ''
  }
}
</script>

<style scoped>
.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.upload-icon {
  width: 48px;
  height: 48px;
  color: var(--weui-brand-color);
}

.upload-icon svg {
  width: 100%;
  height: 100%;
}
</style>
