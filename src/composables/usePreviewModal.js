import { reactive } from 'vue'

const state = reactive({
  visible: false,
  type: 'image',
  src: '',
  info: { 
    width: 0, 
    height: 0, 
    size: 0, 
    duration: 0 
  }
})

export function usePreviewModal() {
  const openPreview = (options) => {
    state.type = options.type || 'image'
    state.src = options.src
    state.info = options.info || {}
    state.visible = true
    document.body.style.overflow = 'hidden'
  }

  const close = () => {
    state.visible = false
    document.body.style.overflow = ''
  }

  return {
    state,
    openPreview,
    close
  }
}

// 简化的导出函数，用于快速显示预览
export function showPreview(type, src, info = {}) {
  state.type = type
  state.src = src
  state.info = info
  state.visible = true
  document.body.style.overflow = 'hidden'
}
