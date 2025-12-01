<template>
  <div 
    class="upload-zone"
    :class="{ dragover: isDragover }"
    @dragenter.prevent="handleDragEnter"
    @dragover.prevent="handleDragEnter"
    @dragleave.prevent="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path :d="iconPath"/>
    </svg>
    <p class="upload-text">{{ text }}</p>
    <p class="upload-hint">{{ hint }}</p>
    <input 
      ref="fileInput"
      type="file" 
      :accept="accept"
      :multiple="multiple"
      @change="handleFileChange"
      @click.stop
    >
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
    default: '点击上传或拖拽文件'
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

const emit = defineEmits(['filesSelected'])

const isDragover = ref(false)
const fileInput = ref(null)

const iconPaths = {
  image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
}

const iconPath = computed(() => iconPaths[props.icon] || iconPaths.image)

const handleDragEnter = () => {
  isDragover.value = true
}

const handleDragLeave = () => {
  isDragover.value = false
}

const handleDrop = (e) => {
  isDragover.value = false
  const files = Array.from(e.dataTransfer.files)
  if (files.length > 0) {
    emit('filesSelected', files)
  }
}

const handleFileChange = (e) => {
  const files = Array.from(e.target.files)
  if (files.length > 0) {
    emit('filesSelected', files)
    e.target.value = ''
  }
}
</script>
