<template>
  <div class="panel-container">
    <!-- 配置卡片 -->
    <div class="card config-card">
      <div class="card-header">
        <div class="card-icon telegram-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .37z"
            />
          </svg>
        </div>
        <div class="card-title-group">
          <h3 class="card-title">{{ t('telegram.config.title') }}</h3>
          <p class="card-subtitle">配置 Bot 和贴纸包信息</p>
        </div>
      </div>

      <div class="config-form">
        <!-- Bot Token -->
        <div class="form-item">
          <label class="form-label" for="bot-token">{{ t('telegram.config.botToken') }}</label>
          <div class="form-input-group">
            <input
              id="bot-token"
              v-model="botToken"
              class="form-input"
              :type="showToken ? 'text' : 'password'"
              :placeholder="t('telegram.config.botTokenPlaceholder')"
              @blur="saveConfig"
            />
            <div class="token-actions">
              <button class="token-icon-btn" :title="showToken ? '隐藏' : '显示'" @click="showToken = !showToken">
                <svg v-if="showToken" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                  />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
                  />
                </svg>
              </button>
              <button
                class="token-validate-btn"
                :class="{ 'token-validate-btn_disabled': !botToken || validating }"
                :disabled="!botToken || validating"
                @click="validateToken"
              >
                <svg
                  v-if="validating"
                  class="spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12" />
                </svg>
                <span>{{ validating ? '验证中' : t('telegram.config.validate') }}</span>
              </button>
            </div>
          </div>
          <!-- Token 验证结果 -->
          <div v-if="botInfo" class="token-result token-result_success">
            <svg class="token-result__icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            <span class="token-result__text">
              已连接
              <strong>@{{ botInfo.username }}</strong>
            </span>
          </div>
          <div v-if="tokenError" class="token-result token-result_error">
            <svg class="token-result__icon" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
              />
            </svg>
            <span class="token-result__text">{{ tokenError }}</span>
          </div>
        </div>

        <!-- 用户 ID -->
        <div class="form-item">
          <label class="form-label" for="user-id">{{ t('telegram.config.userId') }}</label>
          <input
            id="user-id"
            v-model="userId"
            class="form-input"
            type="text"
            :placeholder="t('telegram.config.userIdPlaceholder')"
            @blur="saveConfig"
          />
        </div>

        <!-- 贴纸包名称 -->
        <div class="form-item">
          <label class="form-label" for="pack-name">{{ t('telegram.config.packName') }}</label>
          <input
            id="pack-name"
            v-model="packName"
            class="form-input"
            type="text"
            :placeholder="t('telegram.config.packNamePlaceholder')"
            @blur="saveConfig"
          />
        </div>

        <!-- 贴纸包标题 -->
        <div class="form-item">
          <label class="form-label" for="pack-title">{{ t('telegram.config.packTitle') }}</label>
          <input
            id="pack-title"
            v-model="packTitle"
            class="form-input"
            type="text"
            :placeholder="t('telegram.config.packTitlePlaceholder')"
            @blur="saveConfig"
          />
        </div>

        <!-- 默认表情 -->
        <div class="form-item">
          <label class="form-label" for="default-emoji">{{ t('telegram.config.emoji') }}</label>
          <div class="emoji-input-wrapper" :class="{ 'emoji-input-wrapper_error': !!emojiError }">
            <input
              id="default-emoji"
              v-model="defaultEmoji"
              class="emoji-input"
              type="text"
              inputmode="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="输入 Emoji"
              @input="handleEmojiInput"
              @blur="handleEmojiBlur"
            />
            <span class="emoji-preview" aria-hidden="true">{{ defaultEmoji }}</span>
            <button class="emoji-reset" type="button" title="重置为默认" @click="resetEmoji">↺</button>
          </div>
          <p v-if="emojiError" class="emoji-error">{{ emojiError }}</p>
          <p class="emoji-hint">仅支持单个 Emoji（Windows 可用 Win + . 打开表情面板）</p>
        </div>
      </div>
    </div>

    <!-- 文件选择卡片 -->
    <div class="card files-card">
      <div class="card-header">
        <div class="card-icon files-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="card-title-group">
          <h3 class="card-title">{{ t('telegram.files.title') }}</h3>
          <p v-if="outputFiles.length > 0" class="card-subtitle">
            已选 {{ selectedFiles.length }}/{{ outputFiles.length }}
          </p>
          <p v-else class="card-subtitle">暂无转换完成的文件</p>
        </div>
        <div v-if="outputFiles.length > 0" class="card-actions">
          <button class="btn btn-secondary btn-sm" :disabled="loadingFiles" @click="loadOutputFiles">刷新</button>
        </div>
      </div>

      <!-- 操作栏 -->
      <div v-if="outputFiles.length > 0" class="files-toolbar">
        <label class="checkbox-label">
          <input type="checkbox" class="checkbox" :checked="isAllSelected" @change="toggleSelectAll" />
          <span>{{ t('telegram.files.selectAll') }}</span>
        </label>
        <button v-if="selectedFiles.length > 0" class="btn btn-sm btn-warn" @click="clearSelection">清空选择</button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loadingFiles" class="loading-state">
        <div class="loading-spinner"></div>
        <span>{{ t('telegram.files.loading') }}</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="outputFiles.length === 0" class="empty-state">
        <div class="empty-icon">📁</div>
        <p>{{ t('telegram.files.empty') }}</p>
        <p class="tip">{{ t('telegram.files.emptyHint') }}</p>
        <button class="btn btn-primary btn-sm" style="margin-top: 12px" @click="loadOutputFiles">刷新列表</button>
      </div>

      <!-- 文件网格 -->
      <div v-else class="file-grid">
        <div
          v-for="file in outputFiles"
          :key="file.name"
          class="file-item"
          :class="{ selected: isSelected(file.name) }"
          @click="toggleSelect(file.name)"
        >
          <div class="file-preview">
            <img v-if="file.type === 'static'" :src="file.url" :alt="file.name" />
            <video
              v-else
              :src="file.url"
              muted
              loop
              @mouseenter="$event.target.play()"
              @mouseleave="$event.target.pause()"
            ></video>
            <span class="file-type-badge">{{ file.type === 'static' ? 'WEBP' : 'WEBM' }}</span>
            <span v-if="isSelected(file.name)" class="file-check">✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传卡片 -->
    <div v-if="selectedFiles.length > 0 || uploading || uploadResult" class="card upload-action-card">
      <div class="card-header">
        <div class="card-icon upload-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="card-title-group">
          <h3 class="card-title">上传到 Telegram</h3>
          <p v-if="!uploading && !uploadResult" class="card-subtitle">
            {{
              t('telegram.upload.selected', {
                n: selectedFiles.length
              })
            }}
          </p>
          <p v-else-if="uploading" class="card-subtitle">正在上传...</p>
          <p v-else class="card-subtitle">上传完成</p>
        </div>
      </div>

      <!-- 上传警告 -->
      <div v-if="selectedFiles.length > 120 && !uploading" class="upload-warning">
        <span>⚠️ {{ t('telegram.upload.limitWarning') }}</span>
      </div>

      <!-- 上传进度 -->
      <div v-if="uploading" class="upload-progress">
        <div class="progress-info">
          <span>{{ uploadProgress.current }}/{{ uploadProgress.total }}</span>
          <span>{{ uploadProgress.fileName }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
        </div>
        <span class="progress-percent">{{ progressPercent }}%</span>
      </div>

      <!-- 上传结果 -->
      <div v-if="uploadResult && !uploading" class="upload-result-box">
        <div class="result-stats">
          <span class="text-success">✓ 成功 {{ uploadResult.success }}</span>
          <span v-if="uploadResult.failed > 0" class="text-warn">· 失败 {{ uploadResult.failed }}</span>
        </div>
        <a v-if="uploadResult.packUrl" :href="uploadResult.packUrl" target="_blank" class="btn btn-primary btn-sm">
          查看贴纸包
        </a>
      </div>

      <!-- 上传按钮 -->
      <button
        v-if="!uploadResult"
        class="btn btn-primary btn-block"
        :class="{ 'btn-disabled': !canUpload || uploading }"
        :disabled="!canUpload || uploading"
        @click="startUpload"
      >
        <span v-if="uploading">上传中...</span>
        <span v-else>{{ t('telegram.upload.button') }}</span>
      </button>
    </div>

    <!-- 帮助卡片 -->
    <div class="card help-card">
      <div class="card-header clickable" @click="showHelp = !showHelp">
        <div class="card-icon help-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div class="card-title-group">
          <h3 class="card-title">{{ t('telegram.help.title') }}</h3>
          <p class="card-subtitle">如何获取 Bot Token 和用户 ID</p>
        </div>
        <span class="expand-indicator">{{ showHelp ? '收起' : '展开' }}</span>
      </div>
      <div v-if="showHelp" class="help-content">
        <div class="help-section">
          <h4>{{ t('telegram.help.getToken') }}</h4>
          <ol>
            <li>{{ t('telegram.help.step1') }}</li>
            <li>{{ t('telegram.help.step2') }}</li>
            <li>{{ t('telegram.help.step3') }}</li>
          </ol>
        </div>
        <div class="help-section">
          <h4>{{ t('telegram.help.getUserId') }}</h4>
          <ol>
            <li>{{ t('telegram.help.userStep1') }}</li>
            <li>{{ t('telegram.help.userStep2') }}</li>
          </ol>
        </div>
        <div class="help-section">
          <h4>{{ t('telegram.help.important') }}</h4>
          <ul>
            <li>{{ t('telegram.help.tip1') }}</li>
            <li>{{ t('telegram.help.tip2') }}</li>
            <li>{{ t('telegram.help.tip3') }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const API_BASE = ''

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
const emojiError = ref('')
const lastValidEmoji = ref(defaultEmoji.value)

// Emoji 验证函数
const getFirstGrapheme = value => {
  const text = String(value ?? '').trim()
  if (!text) return ''

  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: 'grapheme' })
    const iterator = segmenter.segment(text)[Symbol.iterator]()
    const first = iterator.next().value
    return first?.segment || ''
  }

  // fallback：对复杂 ZWJ emoji 可能不完美，但至少能截断输入
  return Array.from(text)[0] || ''
}

const isValidEmoji = value => {
  const str = String(value ?? '').trim()
  if (!str) return false

  // 至少包含一个“扩展象形文字”字符，避免把普通符号当成 emoji
  if (!/\p{Extended_Pictographic}/u.test(str)) return false

  // 允许 ZWJ/变体选择符/修饰符/多码点组合
  const emojiRegex = /^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\u200D|\p{Emoji_Modifier}|\p{Extended_Pictographic})*$/u
  return emojiRegex.test(str)
}

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
  return botToken.value && userId.value && packName.value && selectedFiles.value.length > 0 && botInfo.value
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
      lastValidEmoji.value = defaultEmoji.value
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

const handleEmojiInput = event => {
  const raw = event?.target?.value ?? ''
  const first = getFirstGrapheme(raw)

  // 空值允许输入过程存在，失焦时回退
  if (!String(raw).trim()) {
    emojiError.value = ''
    return
  }

  // 始终压缩为“一个 emoji”
  if (first && defaultEmoji.value !== first) {
    defaultEmoji.value = first
  }

  if (first && isValidEmoji(first)) {
    emojiError.value = ''
    lastValidEmoji.value = first
    return
  }

  emojiError.value = '仅支持单个 Emoji'
  defaultEmoji.value = lastValidEmoji.value || '😊'
}

const handleEmojiBlur = () => {
  const first = getFirstGrapheme(defaultEmoji.value)

  if (first && isValidEmoji(first)) {
    defaultEmoji.value = first
    lastValidEmoji.value = first
    emojiError.value = ''
    saveConfig()
    return
  }

  // 空或非法：回退到最后一次有效值
  defaultEmoji.value = lastValidEmoji.value || '😊'
  emojiError.value = ''
  saveConfig()
}

const resetEmoji = () => {
  defaultEmoji.value = '😊'
  lastValidEmoji.value = '😊'
  emojiError.value = ''
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
    // 预先生成 URL，避免模板中重复计算
    outputFiles.value = (data.files || []).map(file => ({
      ...file,
      url: `${API_BASE}/api/telegram/file/${encodeURIComponent(file.name)}`
    }))
  } catch (error) {
    console.error('Failed to load output files:', error)
  } finally {
    loadingFiles.value = false
  }
}

const getFileUrl = fileName => {
  return `${API_BASE}/api/telegram/file/${encodeURIComponent(fileName)}`
}

const isSelected = fileName => {
  return selectedFiles.value.includes(fileName)
}

const toggleSelect = fileName => {
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

const truncateName = name => {
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
const handleWsMessage = message => {
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
/* ===== 卡片化布局 ===== */
.config-card,
.files-card,
.upload-action-card,
.help-card {
  background: var(--weui-bg-2);
  border-radius: var(--weui-radius-lg);
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.telegram-icon {
  background: linear-gradient(135deg, rgba(16, 174, 255, 0.15), rgba(16, 174, 255, 0.05));
  color: var(--weui-blue);
}

.files-icon {
  background: linear-gradient(135deg, rgba(7, 193, 96, 0.15), rgba(7, 193, 96, 0.05));
  color: var(--weui-brand-color);
}

.upload-icon {
  background: linear-gradient(135deg, rgba(250, 157, 59, 0.15), rgba(250, 157, 59, 0.05));
  color: var(--weui-orange);
}

.help-icon {
  background: linear-gradient(135deg, rgba(100, 103, 240, 0.15), rgba(100, 103, 240, 0.05));
  color: var(--weui-purple);
}

.card-actions {
  margin-left: auto;
}

/* ===== 配置表单 ===== */
.config-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-1);
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--weui-fg-divider);
  border-radius: var(--weui-radius-md);
  background: var(--weui-bg-3);
  font-size: var(--weui-font-size-base);
  color: var(--weui-fg-0);
  transition: all 0.2s;
}

.form-input::placeholder {
  color: var(--weui-fg-2);
}

.form-input:focus {
  outline: none;
  border-color: var(--weui-brand-color);
  background: var(--weui-bg-2);
}

.form-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.form-input-group .form-input {
  flex: 1;
}

/* ===== Token 操作按钮 ===== */
.token-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.token-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  color: var(--weui-fg-1);
  background: var(--weui-bg-3);
  border: none;
  border-radius: var(--weui-radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.token-icon-btn:hover {
  background: rgba(7, 193, 96, 0.08);
  border-color: rgba(7, 193, 96, 0.3);
}

.token-icon-btn svg {
  width: 20px;
  height: 20px;
}

.token-validate-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
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

.token-validate-btn svg {
  width: 14px;
  height: 14px;
}

.token-validate-btn_disabled {
  background: var(--weui-fg-3) !important;
  color: var(--weui-fg-2) !important;
  cursor: not-allowed;
}

/* ===== Token 验证结果 ===== */
.token-result {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-top: 8px;
  font-size: var(--weui-font-size-sm);
  border-radius: var(--weui-radius-md);
}

.token-result__icon {
  width: 18px;
  height: 18px;
  padding: 3px;
  border-radius: 50%;
  flex-shrink: 0;
}

.token-result_success {
  background: rgba(7, 193, 96, 0.1);
}

.token-result_success .token-result__icon {
  background: var(--weui-brand-color);
  color: var(--weui-white);
}

.token-result_success .token-result__text {
  color: var(--weui-brand-color);
}

.token-result_error {
  background: rgba(250, 81, 81, 0.1);
}

.token-result_error .token-result__icon {
  background: var(--weui-red);
  color: var(--weui-white);
}

.token-result_error .token-result__text {
  color: var(--weui-red);
}

/* ===== Emoji 输入框 ===== */
.emoji-input-wrapper {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  background: var(--weui-bg-3);
  border: 1px solid var(--weui-fg-divider);
  border-radius: var(--weui-radius-md);
  transition: all 0.2s ease;
}

.emoji-input-wrapper:hover {
  border-color: rgba(7, 193, 96, 0.25);
}

.emoji-input-wrapper:focus-within {
  border-color: var(--weui-brand-color);
  background: var(--weui-bg-2);
  box-shadow: 0 0 0 3px rgba(7, 193, 96, 0.12);
}

.emoji-input-wrapper_error {
  border-color: rgba(250, 81, 81, 0.55);
  box-shadow: 0 0 0 3px rgba(250, 81, 81, 0.12);
}

.emoji-input {
  flex: 1;
  min-width: 0;
  padding: 6px 8px;
  border: none;
  border-radius: calc(var(--weui-radius-md) - 4px);
  background: transparent;
  font-size: 22px;
  color: var(--weui-fg-0);
  line-height: 1.2;
  letter-spacing: 0;
  text-align: center;
  caret-color: var(--weui-brand-color);
}

.emoji-input:focus {
  outline: none;
}

.emoji-input::placeholder {
  color: var(--weui-fg-2);
}

.emoji-preview {
  width: 38px;
  height: 38px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(7, 193, 96, 0.06);
  border: 1px solid rgba(7, 193, 96, 0.18);
  font-size: 22px;
  line-height: 1;
  user-select: none;
}

.emoji-reset {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 1px solid var(--weui-fg-divider);
  background: var(--weui-bg-2);
  color: var(--weui-fg-1);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.emoji-reset:hover {
  border-color: rgba(7, 193, 96, 0.35);
  background: rgba(7, 193, 96, 0.06);
  color: var(--weui-brand-color);
}

.emoji-reset:active {
  transform: scale(0.98);
}

.emoji-error {
  margin: 6px 0 0;
  font-size: var(--weui-font-size-xs);
  color: var(--weui-red);
  display: flex;
  align-items: center;
  gap: 4px;
}

.emoji-error::before {
  content: '⚠️';
  font-size: 12px;
}

.emoji-hint {
  margin: 6px 0 0;
  font-size: var(--weui-font-size-xs);
  color: var(--weui-fg-2);
}

/* ===== 文件选择卡片 ===== */
.files-card .card-header {
  margin-bottom: 12px;
}

.files-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  background: transparent;
  border: 1px solid var(--weui-fg-divider);
  border-radius: var(--weui-radius-md);
  margin-bottom: 14px;
  transition: all 0.2s ease;
}

.files-toolbar:hover {
  border-color: rgba(7, 193, 96, 0.3);
  background: rgba(7, 193, 96, 0.02);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: var(--weui-font-size-md);
  color: var(--weui-fg-0);
  font-weight: 500;
  padding: 4px 8px;
  border-radius: var(--weui-radius-sm);
  transition: all 0.2s ease;
  user-select: none;
}

.checkbox-label:hover {
  background: rgba(7, 193, 96, 0.06);
}

.checkbox {
  width: 20px;
  height: 20px;
  accent-color: var(--weui-brand-color);
  cursor: pointer;
  border-radius: 4px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--weui-fg-1);
  font-size: var(--weui-font-size-sm);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--weui-fg-3);
  border-top-color: var(--weui-brand-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
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

/* ===== 上传卡片 ===== */
.upload-action-card .card-header {
  margin-bottom: 16px;
}

.upload-warning {
  padding: 10px 12px;
  background: rgba(250, 157, 59, 0.1);
  border-radius: var(--weui-radius-md);
  color: var(--weui-orange);
  font-size: var(--weui-font-size-sm);
  margin-bottom: 16px;
}

.upload-progress {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-1);
  margin-bottom: 8px;
}

.progress-bar {
  height: 6px;
  background: var(--weui-bg-3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  background: var(--weui-brand-color);
  transition: width 0.3s ease;
}

.progress-percent {
  font-size: var(--weui-font-size-sm);
  font-weight: 500;
  color: var(--weui-brand-color);
}

.upload-result-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(7, 193, 96, 0.05);
  border-radius: var(--weui-radius-md);
  margin-bottom: 16px;
}

.result-stats {
  font-size: var(--weui-font-size-base);
}

.text-success {
  color: var(--weui-brand-color);
}

.text-warn {
  color: var(--weui-red);
}

/* ===== 帮助卡片 ===== */
.help-card .card-header {
  margin-bottom: 0;
}

.help-card .card-header.clickable {
  cursor: pointer;
  padding: 0;
  margin: 0;
  transition: opacity 0.2s;
}

.help-card .card-header.clickable:hover {
  opacity: 0.8;
}

.expand-indicator {
  margin-left: auto;
  font-size: var(--weui-font-size-md);
  color: var(--weui-brand-color);
  font-weight: 500;
  transition: all 0.2s ease;
  user-select: none;
}

.help-content {
  padding-top: 16px;
  margin-top: 16px;
  font-size: var(--weui-font-size-sm);
  color: var(--weui-fg-1);
  line-height: 1.8;
  border-top: 1px solid var(--weui-fg-divider);
}

.help-section {
  margin-top: 16px;
}

.help-section:first-child {
  margin-top: 0;
}

.help-section h4 {
  margin: 0 0 8px;
  color: var(--weui-fg-0);
  font-size: var(--weui-font-size-md);
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

/* ===== 动画 ===== */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spin {
  animation: spin 1s linear infinite;
}

/* ===== 响应式 ===== */
@media (max-width: 640px) {
  .file-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
