<template>
  <div class="telegram-panel">
    <!-- 配置区域 -->
    <div class="weui-cells__group weui-cells__group_form">
      <div class="weui-cells__title">{{ t('telegram.config.title') }}</div>
      <div class="weui-cells weui-cells_form">
        <!-- Bot Token -->
        <div class="weui-cell">
          <div class="weui-cell__hd"><label class="weui-label">{{ t('telegram.config.botToken') }}</label></div>
          <div class="weui-cell__bd">
            <input v-model="botToken" class="weui-input" :type="showToken ? 'text' : 'password'" :placeholder="t('telegram.config.botTokenPlaceholder')" @blur="saveConfig" />
          </div>
          <div class="weui-cell__ft token-actions">
            <button class="token-icon-btn" @click="showToken = !showToken" :title="showToken ? '隐藏' : '显示'">
              <svg v-if="showToken" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
              <svg v-else viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>
            </button>
            <button 
              class="token-validate-btn" 
              :class="{ 'token-validate-btn_disabled': !botToken || validating }"
              @click="validateToken" 
              :disabled="!botToken || validating"
            >
              <svg v-if="validating" class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12"/></svg>
              <span>{{ validating ? '验证中' : t('telegram.config.validate') }}</span>
            </button>
          </div>
        </div>
        <!-- Token 验证结果 -->
        <div v-if="botInfo" class="token-result token-result_success">
          <svg class="token-result__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          <span class="token-result__text">已连接 <strong>@{{ botInfo.username }}</strong></span>
        </div>
        <div v-if="tokenError" class="token-result token-result_error">
          <svg class="token-result__icon" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          <span class="token-result__text">{{ tokenError }}</span>
        </div>

        <!-- 用户 ID -->
        <div class="weui-cell">
          <div class="weui-cell__hd"><label class="weui-label">{{ t('telegram.config.userId') }}</label></div>
          <div class="weui-cell__bd">
            <input v-model="userId" class="weui-input" type="text" :placeholder="t('telegram.config.userIdPlaceholder')" @blur="saveConfig" />
          </div>
        </div>

        <!-- 贴纸包名称 -->
        <div class="weui-cell">
          <div class="weui-cell__hd"><label class="weui-label">{{ t('telegram.config.packName') }}</label></div>
          <div class="weui-cell__bd">
            <input v-model="packName" class="weui-input" type="text" :placeholder="t('telegram.config.packNamePlaceholder')" @blur="saveConfig" />
          </div>
        </div>

        <!-- 贴纸包标题 -->
        <div class="weui-cell">
          <div class="weui-cell__hd"><label class="weui-label">{{ t('telegram.config.packTitle') }}</label></div>
          <div class="weui-cell__bd">
            <input v-model="packTitle" class="weui-input" type="text" :placeholder="t('telegram.config.packTitlePlaceholder')" @blur="saveConfig" />
          </div>
        </div>

        <!-- 默认表情 -->
        <div class="weui-cell weui-cell_access emoji-cell" @click="showEmojiPicker = !showEmojiPicker">
          <div class="weui-cell__hd"><label class="weui-label">{{ t('telegram.config.emoji') }}</label></div>
          <div class="weui-cell__bd">
            <div class="emoji-preview">
              <span class="emoji-preview__icon">{{ defaultEmoji }}</span>
              <span class="emoji-preview__hint">点击更换</span>
            </div>
          </div>
            <svg class="emoji-arrow" :class="{ 'emoji-arrow_up': showEmojiPicker }" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
            </svg>

        </div>
        <!-- Emoji 选择器 -->
        <div v-if="showEmojiPicker" class="emoji-picker">
          <div class="emoji-grid">
            <button 
              v-for="emoji in emojiList" 
              :key="emoji" 
              class="emoji-item"
              :class="{ 'emoji-item_selected': defaultEmoji === emoji }"
              @click="selectEmoji(emoji)"
            >
              {{ emoji }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 文件选择区域 -->
    <div class="weui-cells__group">
      <div class="weui-cells__title">
        {{ t('telegram.files.title') }}
        <span class="weui-cells__title_counter" v-if="outputFiles.length > 0">{{ selectedFiles.length }}/{{ outputFiles.length }}</span>
      </div>
      <div class="weui-cells">
        <!-- 操作栏 -->
        <div class="weui-cell weui-cell_access" v-if="outputFiles.length > 0">
          <div class="weui-cell__bd">
            <label class="weui-checkbox-label">
              <input type="checkbox" class="weui-checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
              <span>{{ t('telegram.files.selectAll') }}</span>
            </label>
          </div>
          <div class="weui-cell__ft">
            <button class="weui-btn weui-btn_mini weui-btn_default" @click="loadOutputFiles" :disabled="loadingFiles">刷新</button>
            <button v-if="selectedFiles.length > 0" class="weui-btn weui-btn_mini weui-btn_warn" @click="clearSelection">清空</button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="loadingFiles" class="weui-loadmore">
          <i class="weui-loading"></i>
          <span class="weui-loadmore__tips">{{ t('telegram.files.loading') }}</span>
        </div>
      
        <!-- 空状态 -->
        <div v-else-if="outputFiles.length === 0" class="weui-msg__text-area">
          <p class="weui-msg__desc">{{ t('telegram.files.empty') }}</p>
          <p class="weui-msg__desc_light">{{ t('telegram.files.emptyHint') }}</p>
          <button class="weui-btn weui-btn_mini weui-btn_primary" @click="loadOutputFiles" style="margin-top: 12px;">刷新列表</button>
        </div>
      
        <!-- 文件网格 -->
        <div v-else class="file-grid-container">
          <div class="file-grid">
            <div 
              v-for="file in outputFiles" 
              :key="file.name"
              class="file-item"
              :class="{ selected: isSelected(file.name) }"
              @click="toggleSelect(file.name)"
            >
              <div class="file-preview">
                <img v-if="file.type === 'static'" :src="`/output/${file.name}`" :alt="file.name" />
                <video v-else :src="`/output/${file.name}`" muted loop @mouseenter="$event.target.play()" @mouseleave="$event.target.pause()"></video>
                <span class="file-type-badge">{{ file.type === 'static' ? 'WEBP' : 'WEBM' }}</span>
                <span class="file-check" v-if="isSelected(file.name)">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 上传区域 -->
    <div class="weui-cells__group" v-if="selectedFiles.length > 0 || uploading || uploadResult">
      <div class="weui-cells__title">上传到 Telegram</div>
      <div class="weui-cells">
        <!-- 上传信息 -->
        <div class="weui-cell" v-if="selectedFiles.length > 0 && !uploading">
          <div class="weui-cell__bd">
            <p>{{ t('telegram.upload.selected', { n: selectedFiles.length }) }}</p>
            <p class="weui-cell__desc weui-cell__desc_warn" v-if="selectedFiles.length > 120">
              ⚠️ {{ t('telegram.upload.limitWarning') }}
            </p>
          </div>
        </div>

        <!-- 上传进度 -->
        <div class="weui-cell" v-if="uploading">
          <div class="weui-cell__bd">
            <div class="weui-progress">
              <div class="weui-progress__bar">
                <div class="weui-progress__inner-bar" :style="{ width: progressPercent + '%' }"></div>
              </div>
              <span class="weui-progress__opr">{{ progressPercent }}%</span>
            </div>
            <p class="weui-cell__desc">{{ uploadProgress.current }}/{{ uploadProgress.total }} - {{ uploadProgress.fileName }}</p>
          </div>
        </div>
      
        <!-- 上传结果 -->
        <div class="weui-cell" v-if="uploadResult && !uploading">
          <div class="weui-cell__bd">
            <p class="upload-result-text">
              <span class="text-success">✓ 成功 {{ uploadResult.success }}</span>
              <span class="text-warn" v-if="uploadResult.failed > 0"> · 失败 {{ uploadResult.failed }}</span>
            </p>
          </div>
          <div class="weui-cell__ft" v-if="uploadResult.packUrl">
            <a :href="uploadResult.packUrl" target="_blank" class="weui-btn weui-btn_mini weui-btn_primary">查看贴纸包</a>
          </div>
        </div>

        <!-- 上传按钮 -->
        <div class="weui-btn-area">
          <button 
            class="weui-btn weui-btn_primary"
            :class="{ 'weui-btn_disabled': !canUpload || uploading }"
            :disabled="!canUpload || uploading"
            @click="startUpload"
          >
            <span v-if="uploading">上传中...</span>
            <span v-else>{{ t('telegram.upload.button') }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 帮助 -->
    <div class="weui-cells__group">
      <div class="weui-cells">
        <div class="weui-cell weui-cell_access" @click="showHelp = !showHelp">
          <div class="weui-cell__bd"><p>{{ t('telegram.help.title') }}</p></div>
          <div class="weui-cell__ft">{{ showHelp ? '收起' : '展开' }}</div>
        </div>
        <div v-if="showHelp" class="help-content">
          <div class="help-section">
            <h4>{{ t('telegram.help.getToken') }}</h4>
            <ol><li>{{ t('telegram.help.step1') }}</li><li>{{ t('telegram.help.step2') }}</li><li>{{ t('telegram.help.step3') }}</li></ol>
          </div>
          <div class="help-section">
            <h4>{{ t('telegram.help.getUserId') }}</h4>
            <ol><li>{{ t('telegram.help.userStep1') }}</li><li>{{ t('telegram.help.userStep2') }}</li></ol>
          </div>
          <div class="help-section">
            <h4>{{ t('telegram.help.important') }}</h4>
            <ul><li>{{ t('telegram.help.tip1') }}</li><li>{{ t('telegram.help.tip2') }}</li><li>{{ t('telegram.help.tip3') }}</li></ul>
          </div>
        </div>
      </div>
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
const showHelp = ref(false)
const showEmojiPicker = ref(false)

// Emoji 列表
const emojiList = [
  // 表情
  '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊',
  '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😋', '😛', '😜',
  '🤪', '😝', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑',
  '😶', '😏', '😒', '🙄', '😬', '😮', '😯', '😲', '😳', '🥺',
  '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣',
  '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈',
  '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾',
  '🤖', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
  // 手势
  '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞',
  '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍',
  '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝',
  '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂',
  // 爱心
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
  '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
  // 动物
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
  '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆',
  '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋',
  // 食物
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
  '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
  // 物品
  '⭐', '🌟', '✨', '💫', '🔥', '💥', '💢', '💦', '💨', '🕳️',
  '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🎉', '🎊', '🎈'
]

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

const selectEmoji = (emoji) => {
  defaultEmoji.value = emoji
  showEmojiPicker.value = false
  saveConfig()
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
}

/* ===== WeUI 基础组件样式 ===== */
.weui-cells__group {
  margin-top: 8px;
}

.weui-cells__group:first-child {
  margin-top: 0;
}

.weui-cells__title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px !important;
  margin: 0 !important;
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-1);
  font-weight: 500;
}

.weui-cells__title_counter {
  font-weight: normal;
  color: var(--weui-brand-color);
}

.weui-cells {
  background: var(--weui-bg-2);
  overflow: hidden;
  position: relative;
}

.weui-cells::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--weui-fg-divider);
  transform: scaleY(0.5);
}

.weui-cells::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--weui-fg-divider);
  transform: scaleY(0.5);
}

.weui-cell {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  position: relative;
  background: var(--weui-bg-2);
}

.weui-cell::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 16px;
  right: 0;
  height: 1px;
  background: var(--weui-fg-divider);
  transform: scaleY(0.5);
}

.weui-cell:last-child::after {
  display: none;
}

.weui-cell_access {
  cursor: pointer;
}

.weui-cell_access:active {
  background: var(--weui-bg-3);
}

.weui-cell__hd {
  margin-right: 16px;
}

.weui-label {
  display: block;
  width: 5em;
  font-size: var(--weui-font-size-base);
  color: var(--weui-fg-0);
  word-wrap: break-word;
  word-break: keep-all;
  flex-shrink: 0;
}

.weui-cell__bd {
  flex: 1;
  min-width: 0;
}

.weui-cell__ft {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  flex-shrink: 0;
  color: var(--weui-fg-1);
  font-size: var(--weui-font-size-sm);
}

.weui-cell__desc {
  margin-top: 4px;
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-2);
}

.weui-cell__desc_warn {
  color: var(--weui-orange);
}

.weui-input {
  width: 100%;
  border: none;
  background: transparent;
  font-size: var(--weui-font-size-base);
  color: var(--weui-fg-0);
  line-height: 1.4;
}

.weui-input::placeholder {
  color: var(--weui-fg-2);
}

.weui-input:focus {
  outline: none;
}

/* ===== 提示信息 ===== */
.weui-cells__tips {
  padding: 4px 16px 8px;
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-2);
  background: var(--weui-bg-2);
  line-height: 1.4;
}

.weui-cells__tips_success {
  color: var(--weui-brand-color);
}

.weui-cells__tips_warn {
  color: var(--weui-red);
}

/* ===== Token 操作按钮 ===== */
.token-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.token-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  color: var(--weui-fg-1);
  background: transparent;
  border: none;
  border-radius: var(--weui-radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.token-icon-btn:hover {
  background: var(--weui-bg-3);
}

.token-icon-btn:active {
  background: var(--weui-bg-0);
}

.token-icon-btn svg {
  width: 20px;
  height: 20px;
}

.token-validate-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  font-size: var(--weui-font-size-sm);
  font-weight: 500;
  color: var(--weui-white);
  background: var(--weui-brand-color);
  border: none;
  border-radius: var(--weui-radius-md);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.token-validate-btn:hover {
  background: var(--weui-brand-color-dark);
}

.token-validate-btn:active {
  transform: scale(0.97);
}

.token-validate-btn svg {
  width: 14px;
  height: 14px;
}

.token-validate-btn_disabled {
  background: var(--weui-fg-3) !important;
  color: var(--weui-fg-2) !important;
  cursor: not-allowed;
  transform: none !important;
}

/* ===== Token 验证结果 ===== */
.token-result {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  margin: 0;
  font-size: var(--weui-font-size-sm);
  background: var(--weui-bg-2);
  border-top: 1px solid var(--weui-fg-divider);
}

.token-result__icon {
  width: 18px;
  height: 18px;
  padding: 3px;
  border-radius: 50%;
  flex-shrink: 0;
}

.token-result_success {
  background: rgba(7, 193, 96, 0.06);
}

.token-result_success .token-result__icon {
  background: var(--weui-brand-color);
  color: var(--weui-white);
}

.token-result_success .token-result__text {
  color: var(--weui-brand-color);
}

.token-result_success .token-result__text strong {
  font-weight: 600;
}

.token-result_error {
  background: rgba(250, 81, 81, 0.06);
}

.token-result_error .token-result__icon {
  background: var(--weui-red);
  color: var(--weui-white);
}

.token-result_error .token-result__text {
  color: var(--weui-red);
}

/* 加载动画 */
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

.weui-btn {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 12px 24px;
  font-size: var(--weui-font-size-md);
  text-align: center;
  border: none;
  border-radius: var(--weui-radius-md);
  cursor: pointer;
  font-weight: 500;
}

.weui-btn_primary {
  background: var(--weui-brand-color);
  color: var(--weui-white);
}

.weui-btn_primary:active {
  background: var(--weui-brand-color-dark);
}

.weui-btn_default {
  background: var(--weui-bg-3);
  color: var(--weui-fg-0);
}

.weui-btn_default:active {
  background: var(--weui-bg-0);
}

.weui-btn_warn {
  background: var(--weui-red);
  color: var(--weui-white);
}

.weui-btn_warn:active {
  opacity: 0.8;
}

.weui-btn_disabled {
  background: var(--weui-bg-3) !important;
  color: var(--weui-fg-2) !important;
  cursor: not-allowed;
}

.weui-btn_mini {
  display: inline-block;
  width: auto;
  padding: 4px 12px;
  font-size: var(--weui-font-size-sm);
}

.weui-btn-area {
  padding: 8px 16px;
}

/* ===== 加载和消息 ===== */
.weui-loadmore {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px 16px;
  color: var(--weui-fg-1);
  font-size: var(--weui-font-size-sm);
}

.weui-loading {
  width: 20px;
  height: 20px;
  border: 2px solid var(--weui-fg-2);
  border-top-color: var(--weui-brand-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.weui-msg__text-area {
  padding: 32px 16px;
  text-align: center;
}

.weui-msg__desc {
  margin: 0;
  color: var(--weui-fg-1);
  font-size: var(--weui-font-size-base);
}

.weui-msg__desc_light {
  margin-top: 8px;
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-2);
}

/* ===== 复选框 ===== */
.weui-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: var(--weui-font-size-base);
  color: var(--weui-fg-0);
}

.weui-checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--weui-brand-color);
}

/* ===== 进度条 ===== */
.weui-progress {
  display: flex;
  align-items: center;
  gap: 12px;
}

.weui-progress__bar {
  flex: 1;
  height: 4px;
  background: var(--weui-bg-3);
  border-radius: 4px;
  overflow: hidden;
}

.weui-progress__inner-bar {
  height: 100%;
  background: var(--weui-brand-color);
  transition: width 0.3s ease;
  border-radius: 4px;
}

.weui-progress__opr {
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-1);
  min-width: 40px;
  text-align: right;
}

/* ===== Emoji 选择器 ===== */
.emoji-cell {
  transition: background 0.2s;
}

.emoji-cell::after {
  display: none !important;
}

.emoji-cell:active {
  background: var(--weui-bg-3);
}

.emoji-preview {
  display: flex;
  align-items: center;
  gap: 12px;
}

.emoji-preview__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 26px;
  background: var(--weui-bg-3);
  border-radius: var(--weui-radius-md);
}

.emoji-preview__hint {
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-2);
}

.emoji-arrow {
  width: 20px;
  height: 20px;
  color: var(--weui-fg-2);
  transition: transform 0.2s;
}

.emoji-arrow_up {
  transform: rotate(180deg);
}

.emoji-picker {
  background: var(--weui-bg-3);
  padding: 12px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 240px;
  overflow-y: auto;
  background: var(--weui-bg-2);
  border-radius: var(--weui-radius-md);
  padding: 8px;
}

.emoji-item {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  font-size: 22px;
  background: transparent;
  border: none;
  border-radius: var(--weui-radius-md);
  cursor: pointer;
  transition: all 0.15s;
}

.emoji-item:hover {
  background: var(--weui-bg-3);
  transform: scale(1.2);
}

.emoji-item:active {
  transform: scale(0.95);
}

.emoji-item_selected {
  background: rgba(7, 193, 96, 0.15);
  box-shadow: inset 0 0 0 2px var(--weui-brand-color);
}

/* ===== 文件网格 ===== */
.file-grid-container {
  padding: 12px 16px;
}

.file-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 10px;
  max-height: 360px;
  overflow-y: auto;
}

.file-item {
  position: relative;
  background: var(--weui-bg-3);
  border-radius: var(--weui-radius-md);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.file-item:hover {
  border-color: var(--weui-brand-color);
}

.file-item.selected {
  border-color: var(--weui-brand-color);
  background: rgba(7, 193, 96, 0.05);
}

.file-preview {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--weui-bg-3);
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
  border-radius: 6px;
  font-size: 9px;
  color: var(--weui-white);
  font-weight: 500;
}

.file-check {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  background: var(--weui-brand-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--weui-white);
  font-size: 12px;
  font-weight: bold;
}

/* ===== 上传结果 ===== */
.upload-result-text {
  margin: 0;
  font-size: var(--weui-font-size-base);
}

.text-success {
  color: var(--weui-brand-color);
}

.text-warn {
  color: var(--weui-red);
}

/* ===== 帮助内容 ===== */
.help-content {
  padding: 0 16px 16px;
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-1);
  line-height: 1.8;
  border-top: 1px solid var(--weui-fg-divider);
}

.help-section {
  margin-top: 12px;
}

.help-section:first-child {
  margin-top: 0;
  padding-top: 12px;
}

.help-section h4 {
  margin: 0 0 8px;
  color: var(--weui-fg-0);
  font-size: var(--weui-font-size-base);
  font-weight: 500;
}

.help-section ol,
.help-section ul {
  margin: 0;
  padding-left: 20px;
}

.help-section li {
  margin-bottom: 4px;
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .file-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .weui-btn-area_inline {
    flex-direction: column;
  }
}
</style>
