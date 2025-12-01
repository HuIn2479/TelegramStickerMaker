<template>
  <div class="history-panel">
    <div class="history-header">
      <h3>历史记录</h3>
      <div class="history-actions">
        <span class="history-count">{{ history.length }} 条记录</span>
        <button v-if="history.length > 0" @click="handleClearHistory" class="btn-clear">
          清空
        </button>
      </div>
    </div>

    <div v-if="history.length === 0" class="empty-state">
      <p>暂无历史记录</p>
      <p class="tip">转换记录会自动保存 24 小时</p>
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
            title="下载 PNG"
          >
            PNG
          </button>
          <button 
            v-if="item.result?.webp" 
            @click="handleDownload(item.result.webp, item.fileName + '.webp')"
            class="btn-download"
            title="下载 WEBP"
          >
            WEBP
          </button>
          <button 
            v-if="item.result?.webm" 
            @click="handleDownload(item.result.webm, item.fileName + '.webm')"
            class="btn-download"
            title="下载 WEBM"
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
import { getHistory, clearHistory, formatFileSize, downloadFile } from '../utils/helpers'
import { showPreview } from '../composables/usePreviewModal'

const history = ref([])

const loadHistory = () => {
  history.value = getHistory()
}

const handleClearHistory = () => {
  if (confirm('确定要清空历史记录吗？')) {
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
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  
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
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.history-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.history-count {
  font-size: 14px;
  color: #666;
}

.btn-clear {
  padding: 6px 12px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.btn-clear:hover {
  background: #d32f2f;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin: 5px 0;
}

.empty-state .tip {
  font-size: 13px;
  color: #bbb;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
  transition: background 0.3s;
}

.history-item:hover {
  background: #f0f0f0;
}

.history-preview {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border-radius: 4px;
  overflow: hidden;
  background: white;
  cursor: pointer;
  border: 1px solid #e0e0e0;
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
  color: #333;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-meta {
  display: flex;
  gap: 10px;
  font-size: 13px;
  color: #666;
}

.history-time {
  color: #999;
}

.history-downloads {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-download {
  padding: 6px 12px;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: background 0.3s;
}

.btn-download:hover {
  background: #1976D2;
}
</style>
