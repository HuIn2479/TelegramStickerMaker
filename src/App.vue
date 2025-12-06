<template>
  <div class="container">
    <header>
      <div class="header-content">
        <div>
          <h1>{{ t('header.title') }}</h1>
          <p class="subtitle">{{ t('header.subtitle') }}</p>
        </div>
        <div class="language-switcher">
          <button 
            class="lang-btn" 
            :class="{ active: locale === 'zh' }"
            @click="changeLanguage('zh')"
          >
            中文
          </button>
          <button 
            class="lang-btn" 
            :class="{ active: locale === 'en' }"
            @click="changeLanguage('en')"
          >
            EN
          </button>
        </div>
      </div>
    </header>

    <div class="tabs">
      <button 
        class="tab" 
        :class="{ active: activeTab === 'static' }"
        @click="activeTab = 'static'"
      >
        {{ t('tabs.static') }}
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'video' }"
        @click="activeTab = 'video'"
      >
        {{ t('tabs.video') }}
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        {{ t('tabs.history') }}
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'upload' }"
        @click="activeTab = 'upload'"
      >
        {{ t('tabs.upload') }}
      </button>
    </div>

    <div class="panel" v-show="activeTab === 'static'">
      <StaticStickerPanel @converted="handleConverted" />
    </div>

    <div class="panel" v-show="activeTab === 'video'">
      <VideoStickerPanel @converted="handleConverted" />
    </div>

    <div class="panel" v-show="activeTab === 'history'">
      <HistoryPanel ref="historyRef" />
    </div>

    <div class="panel" v-show="activeTab === 'upload'">
      <TelegramUploadPanel />
    </div>

    <PreviewModal />

    <footer>
      <p>
        {{ t('footer.text') }} <a href="https://core.telegram.org/stickers" target="_blank">{{ t('footer.link') }}</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, provide } from 'vue'
import { useI18n } from 'vue-i18n'
import StaticStickerPanel from './components/StaticStickerPanel.vue'
import VideoStickerPanel from './components/VideoStickerPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import TelegramUploadPanel from './components/TelegramUploadPanel.vue'
import PreviewModal from './components/PreviewModal.vue'
import { useWebSocket } from './composables/useWebSocket'

const { t, locale } = useI18n()
const activeTab = ref('static')
const historyRef = ref(null)

// 初始化 WebSocket
const { connect, disconnect, subscribe, unsubscribe, connected } = useWebSocket()

// 提供 WebSocket 方法给子组件
provide('websocket', { subscribe, unsubscribe, connected })

onMounted(() => {
  connect()
})

onBeforeUnmount(() => {
  disconnect()
})

const changeLanguage = (lang) => {
  locale.value = lang
  localStorage.setItem('language', lang)
}

const handleConverted = () => {
  // 转换完成后刷新历史记录
  if (historyRef.value) {
    historyRef.value.loadHistory()
  }
}
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.language-switcher {
  display: flex;
  gap: var(--spacing-xs);
  background: var(--bg-secondary);
  padding: var(--spacing-xs);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
}

.lang-btn {
  padding: 4px var(--spacing-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all 0.15s ease;
}

.lang-btn:hover {
  color: var(--text-primary);
}

.lang-btn.active {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

@media (max-width: 640px) {
  .header-content {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}
</style>
