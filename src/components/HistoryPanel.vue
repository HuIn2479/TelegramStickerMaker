<template>
  <div class="history-panel">
    <div class="history-header">
      <h3>{{ t('history.title') }}</h3>
      <div class="history-actions">
        <span class="history-count">{{ history.length }} {{ t('history.items') }}</span>
        <button v-if="history.length > 0" @click="handleClearHistory" class="btn-clear">
          {{ t('history.clear') }}
        </button>
      </div>
    </div>

    <div v-if="history.length === 0" class="empty-state">
      <p>{{ t('history.empty') }}</p>
      <p class="tip">{{ t('history.tip') }}</p>
    </div>

    <div v-else class="history-list">
      <div 
        v-for="item in history" 
        :key="item.id"
        class="history-item"
      >
        <div class="history-preview" @click="handlePreview(item)">
          <img 
            v-if="item.type === 'image'" 
            :src="item.preview || item.result?.png" 
            :alt="item.fileName"
          >
          <video 
            v-else 
            :src="item.preview || item.result?.webm" 
            muted
          ></video>
        </div>
        
        <div class="history-info">
          <div class="history-name">{{ item.fileName }}</div>
          <div class="history-meta">
            <span v-if="item.width && item.height">{{ item.width }}×{{ item.height }}</span>
            <span>{{ formatFileSize(item.size || 0) }}</span>
            <span class="history-time">{{ formatTime(item.timestamp) }}</span>
          </div>
        </div>

        <div class="history-downloads">
          <button 
            v-if="item.result?.png" 
            @click="handleDownload(item.result.png, item.fileName + '.png')"
            class="btn-download"
            title="Download PNG"
          >
            PNG
          </button>
          <button 
            v-if="item.result?.webp" 
            @click="handleDownload(item.result.webp, item.fileName + '.webp')"
            class="btn-download"
            title="Download WEBP"
          >
            WEBP
          </button>
          <button 
            v-if="item.result?.webm" 
            @click="handleDownload(item.result.webm, item.fileName + '.webm')"
            class="btn-download"
            title="Download WEBM"
          >
            WEBM
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getHistory, clearHistory, formatFileSize, downloadFile } from '../utils/helpers'
import { showPreview } from '../composables/usePreviewModal'

const { t } = useI18n()

const history = ref([])

const loadHistory = () => {
  history.value = getHistory()
}

const handleClearHistory = () => {
  if (confirm(t('alerts.clearHistory'))) {
    clearHistory()
    loadHistory()
  }
}

const handlePreview = (item) => {
  if (item.type === 'image') {
    showPreview('image', item.result?.png || item.preview, {
      width: item.width,
      height: item.height,
      size: item.size
    })
  } else {
    showPreview('video', item.result?.webm || item.preview, {
      duration: item.duration,
      size: item.size
    })
  }
}

const handleDownload = (url, filename) => {
  downloadFile(url, filename)
}

const formatTime = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  
  if (minutes < 1) return t('history.justNow')
  if (minutes < 60) return t('history.minutesAgo', { n: minutes })
  if (hours < 24) return t('history.hoursAgo', { n: hours })
  
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  loadHistory()
  // 每30秒刷新一次，更新时间显示
  setInterval(loadHistory, 30000)
})

// 暴露方法供父组件调用
defineExpose({
  loadHistory
})
</script>

<style scoped>
.history-panel {
  background: transparent;
  border-radius: 0;
  padding: 0;
  box-shadow: none;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding-bottom: 0;
  border-bottom: none;
}

.history-header h3 {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 600;
  letter-spacing: -0.2px;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.history-count {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.btn-clear {
  padding: 6px var(--spacing-md);
  background: var(--bg-tertiary);
  color: var(--error);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.btn-clear:hover {
  background: rgba(239, 83, 80, 0.12);
  border-color: rgba(239, 83, 80, 0.2);
}

.empty-state {
  text-align: center;
  padding: 60px var(--spacing-xl);
  color: var(--text-secondary);
}

.empty-state p {
  margin: var(--spacing-xs) 0;
}

.empty-state .tip {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  max-height: 600px;
  overflow-y: auto;
  padding: 2px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  transition: all 0.2s ease;
}

.history-item:hover {
  background: var(--bg-hover);
  border-color: var(--border-light);
}

.history-preview {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: url('data:image/svg+xml;utf8,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="10" height="10" fill="%230e1621"/><rect x="10" y="0" width="10" height="10" fill="%2317212b"/><rect x="0" y="10" width="10" height="10" fill="%2317212b"/><rect x="10" y="10" width="10" height="10" fill="%230e1621"/></svg>');
  cursor: pointer;
  border: 1px solid var(--border-light);
}

.history-preview img,
.history-preview video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-name {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.875rem;
}

.history-meta {
  display: flex;
  gap: var(--spacing-sm);
  font-size: 0.75rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.history-time {
  color: var(--text-tertiary);
}

.history-downloads {
  display: flex;
  gap: var(--spacing-xs);
  flex-shrink: 0;
  flex-wrap: wrap;
}

.btn-download {
  padding: 6px var(--spacing-md);
  background: var(--bg-secondary);
  color: var(--accent);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-download:hover {
  background: rgba(82, 136, 193, 0.12);
  border-color: rgba(82, 136, 193, 0.2);
}
</style>
