<template>
  <div class="telegram-panel">
    <!-- 配置区域 -->
    <div class="config-section">
      <h3>{{ t('telegram.config.title') }}</h3>
      
      <div class="form-group">
        <label>{{ t('telegram.config.botToken') }}</label>
        <div class="input-with-action">
          <input 
            v-model="botToken" 
            :type="showToken ? 'text' : 'password'"
            :placeholder="t('telegram.config.botTokenPlaceholder')"
            @blur="saveConfig"
          />
          <button class="btn-icon" @click="showToken = !showToken">
            {{ showToken ? '🙈' : '👁️' }}
          </button>
          <button 
            class="btn-validate" 
            @click="validateToken"
            :disabled="!botToken || validating"
          >
            {{ validating ? '...' : t('telegram.config.validate') }}
          </button>
        </div>
        <div v-if="botInfo" class="bot-info success">
          ✅ @{{ botInfo.username }}
        </div>
        <div v-if="tokenError" class="bot-info error">
          ❌ {{ tokenError }}
        </div>
      </div>
      
      <div class="form-group">
        <label>{{ t('telegram.config.userId') }}</label>
        <input 
          v-model="userId" 
          type="text"
          :placeholder="t('telegram.config.userIdPlaceholder')"
          @blur="saveConfig"
        />
        <div class="hint">
          {{ t('telegram.config.userIdHint') }}
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group flex-1">
          <label>{{ t('telegram.config.packName') }}</label>
          <input 
            v-model="packName" 
            type="text"
            :placeholder="t('telegram.config.packNamePlaceholder')"
            @blur="saveConfig"
          />
        </div>
        <div class="form-group flex-1">
          <label>{{ t('telegram.config.packTitle') }}</label>
          <input 
            v-model="packTitle" 
            type="text"
            :placeholder="t('telegram.config.packTitlePlaceholder')"
            @blur="saveConfig"
          />
        </div>
      </div>
      
      <div class="form-group">
        <label>{{ t('telegram.config.emoji') }}</label>
        <input 
          v-model="defaultEmoji" 
          type="text"
          class="emoji-input"
          :placeholder="t('telegram.config.emojiPlaceholder')"
          @blur="saveConfig"
        />
      </div>
    </div>
    
    <!-- 文件列表 -->
    <div class="files-section">
      <div class="section-header">
        <h3>{{ t('telegram.files.title') }}</h3>
        <div class="file-actions">
          <button class="btn-refresh" @click="loadOutputFiles" :disabled="loadingFiles">
            🔄 {{ t('telegram.files.refresh') }}
          </button>
          <button 
            v-if="selectedFiles.length > 0"
            class="btn-clear-selection" 
            @click="clearSelection"
          >
            {{ t('telegram.files.clearSelection') }}
          </button>
        </div>
      </div>
      
      <div v-if="loadingFiles" class="loading">
        {{ t('telegram.files.loading') }}
      </div>
      
      <div v-else-if="outputFiles.length === 0" class="empty-state">
        <p>{{ t('telegram.files.empty') }}</p>
        <p class="hint">{{ t('telegram.files.emptyHint') }}</p>
      </div>
      
      <div v-else class="file-list">
        <div class="select-all">
          <label class="checkbox-label">
            <input 
              type="checkbox" 
              :checked="isAllSelected"
              @change="toggleSelectAll"
            />
            {{ t('telegram.files.selectAll') }} ({{ selectedFiles.length }}/{{ outputFiles.length }})
          </label>
        </div>
        
        <div class="file-grid">
          <div 
            v-for="file in outputFiles" 
            :key="file.name"
            class="file-item"
            :class="{ selected: isSelected(file.name) }"
            @click="toggleSelect(file.name)"
          >
            <div class="file-preview">
              <img 
                v-if="file.type === 'static'" 
                :src="`/output/${file.name}`"
                :alt="file.name"
              />
              <video 
                v-else 
                :src="`/output/${file.name}`"
                muted
                loop
                @mouseenter="$event.target.play()"
                @mouseleave="$event.target.pause()"
              ></video>
              <div class="file-type-badge">{{ file.type === 'static' ? 'WEBP' : 'WEBM' }}</div>
            </div>
            <div class="file-name" :title="file.name">{{ truncateName(file.name) }}</div>
            <div class="checkbox-overlay">
              <input 
                type="checkbox" 
                :checked="isSelected(file.name)"
                @click.stop
                @change="toggleSelect(file.name)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 上传控制 -->
    <div class="upload-section">
      <div class="upload-info" v-if="selectedFiles.length > 0">
        <span>{{ t('telegram.upload.selected', { n: selectedFiles.length }) }}</span>
        <span class="warning" v-if="selectedFiles.length > 120">
          ⚠️ {{ t('telegram.upload.limitWarning') }}
        </span>
      </div>
      
      <button 
        class="btn-upload"
        :disabled="!canUpload || uploading"
        @click="startUpload"
      >
        <span v-if="uploading">
          {{ t('telegram.upload.uploading') }} ({{ uploadProgress.current }}/{{ uploadProgress.total }})
        </span>
        <span v-else>
          📤 {{ t('telegram.upload.button') }}
        </span>
      </button>
      
      <!-- 上传进度 -->
      <div v-if="uploading || uploadComplete" class="upload-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercent + '%' }"
            :class="{ complete: uploadComplete }"
          ></div>
        </div>
        <div class="progress-text">
          {{ uploadProgress.current }} / {{ uploadProgress.total }}
          <span v-if="uploadProgress.fileName" class="current-file">
            - {{ uploadProgress.fileName }}
          </span>
        </div>
      </div>
      
      <!-- 上传结果 -->
      <div v-if="uploadResult" class="upload-result" :class="{ success: uploadResult.success > 0 }">
        <div class="result-summary">
          <span class="success-count">✅ {{ uploadResult.success }}</span>
          <span v-if="uploadResult.failed > 0" class="failed-count">❌ {{ uploadResult.failed }}</span>
        </div>
        <a 
          v-if="uploadResult.packUrl" 
          :href="uploadResult.packUrl" 
          target="_blank"
          class="pack-link"
        >
          📱 {{ t('telegram.upload.viewPack') }}
        </a>
      </div>
    </div>
    
    <!-- 帮助提示 -->
    <div class="help-section">
      <details>
        <summary>{{ t('telegram.help.title') }}</summary>
        <div class="help-content">
          <h4>{{ t('telegram.help.getToken') }}</h4>
          <ol>
            <li>{{ t('telegram.help.step1') }}</li>
            <li>{{ t('telegram.help.step2') }}</li>
            <li>{{ t('telegram.help.step3') }}</li>
          </ol>
          
          <h4>{{ t('telegram.help.getUserId') }}</h4>
          <ol>
            <li>{{ t('telegram.help.userStep1') }}</li>
            <li>{{ t('telegram.help.userStep2') }}</li>
          </ol>
          
          <h4>{{ t('telegram.help.important') }}</h4>
          <ul>
            <li>{{ t('telegram.help.tip1') }}</li>
            <li>{{ t('telegram.help.tip2') }}</li>
            <li>{{ t('telegram.help.tip3') }}</li>
          </ul>
        </div>
      </details>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { getApiBaseUrl } from '../utils/env'

const { t } = useI18n()
const API_BASE = getApiBaseUrl()

// WebSocket 订阅
const { subscribe, unsubscribe } = inject('websocket')

// 配置状态
const botToken = ref('')
const userId = ref('')
const packName = ref('')
const packTitle = ref('')
const defaultEmoji = ref('😊')
const showToken = ref(false)
const validating = ref(false)
const botInfo = ref(null)
const tokenError = ref('')

// 文件状态
const outputFiles = ref([])
const selectedFiles = ref([])
const loadingFiles = ref(false)

// 上传状态
const uploading = ref(false)
const uploadComplete = ref(false)
const uploadProgress = ref({ current: 0, total: 0, fileName: '' })
const uploadResult = ref(null)

// 计算属性
const isAllSelected = computed(() => {
  return outputFiles.value.length > 0 && selectedFiles.value.length === outputFiles.value.length
})

const canUpload = computed(() => {
  return botToken.value && 
         userId.value && 
         packName.value && 
         selectedFiles.value.length > 0 &&
         botInfo.value
})

const progressPercent = computed(() => {
  if (uploadProgress.value.total === 0) return 0
  return Math.round((uploadProgress.value.current / uploadProgress.value.total) * 100)
})

// 方法
const loadConfig = () => {
  const saved = localStorage.getItem('telegram_config')
  if (saved) {
    try {
      const config = JSON.parse(saved)
      botToken.value = config.botToken || ''
      userId.value = config.userId || ''
      packName.value = config.packName || ''
      packTitle.value = config.packTitle || ''
      defaultEmoji.value = config.emoji || '😊'
    } catch {}
  }
}

const saveConfig = () => {
  const config = {
    botToken: botToken.value,
    userId: userId.value,
    packName: packName.value,
    packTitle: packTitle.value,
    emoji: defaultEmoji.value
  }
  localStorage.setItem('telegram_config', JSON.stringify(config))
}

const validateToken = async () => {
  if (!botToken.value) return
  
  validating.value = true
  tokenError.value = ''
  botInfo.value = null
  
  try {
    const response = await fetch(`${API_BASE}/api/telegram/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ botToken: botToken.value })
    })
    
    const data = await response.json()
    
    if (data.valid) {
      botInfo.value = data.bot
      saveConfig()
    } else {
      tokenError.value = data.error || 'Invalid token'
    }
  } catch (error) {
    tokenError.value = error.message
  } finally {
    validating.value = false
  }
}

const loadOutputFiles = async () => {
  loadingFiles.value = true
  
  try {
    const response = await fetch(`${API_BASE}/api/telegram/output-files`)
    const data = await response.json()
    outputFiles.value = data.files || []
  } catch (error) {
    console.error('Failed to load output files:', error)
  } finally {
    loadingFiles.value = false
  }
}

const isSelected = (fileName) => {
  return selectedFiles.value.includes(fileName)
}

const toggleSelect = (fileName) => {
  const index = selectedFiles.value.indexOf(fileName)
  if (index === -1) {
    selectedFiles.value.push(fileName)
  } else {
    selectedFiles.value.splice(index, 1)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedFiles.value = []
  } else {
    selectedFiles.value = outputFiles.value.map(f => f.name)
  }
}

const clearSelection = () => {
  selectedFiles.value = []
}

const truncateName = (name) => {
  if (name.length > 15) {
    return name.substring(0, 12) + '...'
  }
  return name
}

const startUpload = async () => {
  if (!canUpload.value) return
  
  uploading.value = true
  uploadComplete.value = false
  uploadResult.value = null
  uploadProgress.value = { current: 0, total: selectedFiles.value.length, fileName: '' }
  
  try {
    const response = await fetch(`${API_BASE}/api/telegram/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        botToken: botToken.value,
        userId: parseInt(userId.value),
        packName: packName.value,
        packTitle: packTitle.value || 'My Sticker Pack',
        emoji: defaultEmoji.value,
        files: selectedFiles.value
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }
    
    // 上传已开始，等待 WebSocket 通知
  } catch (error) {
    uploading.value = false
    alert(error.message)
  }
}

// WebSocket 消息处理
const handleWsMessage = (message) => {
  if (message.type === 'telegram_upload_progress') {
    uploadProgress.value = {
      current: message.current,
      total: message.total,
      fileName: message.fileName
    }
  } else if (message.type === 'telegram_upload_complete') {
    uploading.value = false
    uploadComplete.value = true
    uploadResult.value = message.results
    // 刷新文件列表
    loadOutputFiles()
  } else if (message.type === 'telegram_upload_error') {
    uploading.value = false
    alert(message.error)
  }
}

// 生命周期
onMounted(() => {
  loadConfig()
  loadOutputFiles()
  
  // 如果有保存的 token，自动验证
  if (botToken.value) {
    validateToken()
  }
  
  // 订阅 WebSocket 消息
  subscribe('telegram', handleWsMessage)
})

onUnmounted(() => {
  unsubscribe('telegram')
})
</script>

<style scoped>
.telegram-panel {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

/* 配置区域 */
.config-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.config-section h3 {
  margin-bottom: var(--spacing-lg);
  font-size: 1rem;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.form-group input {
  width: 100%;
  padding: 10px var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
}

.form-row {
  display: flex;
  gap: var(--spacing-md);
}

.flex-1 {
  flex: 1;
}

.input-with-action {
  display: flex;
  gap: var(--spacing-xs);
}

.input-with-action input {
  flex: 1;
}

.btn-icon {
  padding: 10px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 1rem;
}

.btn-validate {
  padding: 10px var(--spacing-md);
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 0.875rem;
  cursor: pointer;
  white-space: nowrap;
}

.btn-validate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bot-info {
  margin-top: var(--spacing-xs);
  font-size: 0.8125rem;
}

.bot-info.success {
  color: var(--success);
}

.bot-info.error {
  color: var(--error);
}

.hint {
  margin-top: var(--spacing-xs);
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.emoji-input {
  max-width: 100px;
}

/* 文件列表 */
.files-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.section-header h3 {
  font-size: 1rem;
  color: var(--text-primary);
}

.file-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-refresh,
.btn-clear-selection {
  padding: 6px var(--spacing-md);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;
}

.btn-refresh:hover,
.btn-clear-selection:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.loading,
.empty-state {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--text-secondary);
}

.empty-state .hint {
  margin-top: var(--spacing-sm);
}

.select-all {
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-subtle);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--spacing-md);
  max-height: 400px;
  overflow-y: auto;
  padding: var(--spacing-xs);
}

.file-item {
  position: relative;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 2px solid transparent;
}

.file-item:hover {
  border-color: var(--border-light);
}

.file-item.selected {
  border-color: var(--accent);
}

.file-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
}

.file-preview img,
.file-preview video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-type-badge {
  position: absolute;
  bottom: 4px;
  right: 4px;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  font-size: 0.625rem;
  color: white;
}

.file-name {
  padding: 6px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.checkbox-overlay {
  position: absolute;
  top: 6px;
  left: 6px;
}

.checkbox-overlay input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

/* 上传区域 */
.upload-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
}

.upload-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.upload-info .warning {
  color: var(--warning);
}

.btn-upload {
  width: 100%;
  padding: 14px;
  background: var(--accent);
  border: none;
  border-radius: var(--radius-sm);
  color: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
}

.btn-upload:hover:not(:disabled) {
  background: var(--accent-hover);
}

.btn-upload:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.upload-progress {
  margin-top: var(--spacing-md);
}

.progress-bar {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

.progress-fill.complete {
  background: var(--success);
}

.progress-text {
  margin-top: var(--spacing-xs);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  text-align: center;
}

.current-file {
  color: var(--text-tertiary);
}

.upload-result {
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  text-align: center;
}

.result-summary {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
}

.success-count {
  color: var(--success);
}

.failed-count {
  color: var(--error);
}

.pack-link {
  display: inline-block;
  padding: 8px var(--spacing-md);
  background: var(--accent);
  border-radius: var(--radius-sm);
  color: white;
  text-decoration: none;
  font-size: 0.875rem;
}

.pack-link:hover {
  background: var(--accent-hover);
}

/* 帮助区域 */
.help-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.help-section summary {
  padding: var(--spacing-md) var(--spacing-lg);
  cursor: pointer;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.help-section summary:hover {
  background: var(--bg-tertiary);
}

.help-content {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

.help-content h4 {
  margin-top: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
  font-size: 0.875rem;
}

.help-content ol,
.help-content ul {
  margin-left: var(--spacing-lg);
}

.help-content li {
  margin-bottom: var(--spacing-xs);
}

/* 响应式 */
@media (max-width: 640px) {
  .form-row {
    flex-direction: column;
  }
  
  .file-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}
</style>
