<template>
  <div class="panel-container">
    <!-- 历史记录卡片 -->
    <div class="card history-card">
      <div class="card-header">
        <div class="card-icon history-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="card-title-group">
          <h3 class="card-title">{{ t('history.title') }}</h3>
          <p class="card-subtitle">{{ history.length }} {{ t('history.items') }}</p>
        </div>
        <button v-if="history.length > 0" class="btn-clear" @click="handleClearHistory">
          {{ t('history.clear') }}
        </button>
      </div>

      <div v-if="history.length === 0" class="empty-state">
        <div class="empty-icon">📭</div>
        <p>{{ t('history.empty') }}</p>
        <p class="tip">{{ t('history.tip') }}</p>
      </div>

      <div v-else class="history-list">
        <div v-for="item in history" :key="item.id" class="history-item">
          <div class="history-preview" @click="handlePreview(item)">
            <img v-if="item.type === 'image'" :src="item.preview || item.result?.png" :alt="item.fileName" />
            <video v-else :src="item.preview || item.result?.webm" muted></video>
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
              class="btn-download"
              title="Download PNG"
              @click="handleDownload(item.result.png, item.fileName + '.png')"
            >
              PNG
            </button>
            <button
              v-if="item.result?.webp"
              class="btn-download"
              title="Download WEBP"
              @click="handleDownload(item.result.webp, item.fileName + '.webp')"
            >
              WEBP
            </button>
            <button
              v-if="item.result?.webm"
              class="btn-download"
              title="Download WEBM"
              @click="handleDownload(item.result.webm, item.fileName + '.webm')"
            >
              WEBM
            </button>
          </div>
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

const handlePreview = item => {
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

const formatTime = timestamp => {
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
/* 历史记录卡片 */
.history-card {
  background: var(--weui-bg-2);
  border-radius: var(--weui-radius-lg);
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.history-card .card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--weui-fg-divider);
}

.history-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(100, 103, 240, 0.15), rgba(100, 103, 240, 0.05));
  border-radius: var(--weui-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--weui-purple);
  flex-shrink: 0;
}

.history-icon svg {
  width: 22px;
  height: 22px;
}

.btn-clear {
  padding: 6px 12px;
  background: transparent;
  color: var(--weui-red);
  border: 1px solid var(--weui-red);
  border-radius: 14px;
  cursor: pointer;
  font-size: var(--weui-font-size-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  margin-left: auto;
}

.btn-clear:hover {
  background: rgba(250, 81, 81, 0.1);
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: var(--weui-fg-1);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 6px 0;
}

.empty-state .tip {
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-2);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 500px;
  overflow-y: auto;
  padding: 2px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--weui-cell-padding-v) var(--weui-cell-padding-h);
  background: var(--weui-bg-3);
  border-radius: var(--weui-radius-md);
  transition: all 0.2s ease;
}

.history-item:hover {
  background: var(--weui-bg-4);
}

.history-preview {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: var(--weui-radius-md);
  overflow: hidden;
  background: var(--weui-bg-2);
  cursor: pointer;
  border: 1px solid var(--weui-fg-divider);
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
  color: var(--weui-fg-0);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: var(--weui-font-size-md);
}

.history-meta {
  display: flex;
  gap: 8px;
  font-size: var(--weui-font-size-xs);
  color: var(--weui-fg-1);
  flex-wrap: wrap;
}

.history-time {
  color: var(--weui-fg-2);
}

.history-downloads {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.btn-download {
  padding: 4px 10px;
  background: var(--weui-bg-2);
  color: var(--weui-brand-color);
  border: 1px solid var(--weui-fg-divider);
  border-radius: 12px;
  cursor: pointer;
  font-size: var(--weui-font-size-xs);
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-download:hover {
  background: rgba(7, 193, 96, 0.1);
  border-color: var(--weui-brand-color);
}
</style>
