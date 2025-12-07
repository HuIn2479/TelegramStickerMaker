<template>
  <div class="weui-page">
    <div class="container">
      <!-- WeUI 导航栏 -->
      <div class="weui-navigation-bar">
        <div class="weui-navigation-bar__inner">
          <div>
            <div class="weui-navigation-bar__title">{{ t('header.title') }}</div>
            <div class="weui-navigation-bar__subtitle">{{ t('header.subtitle') }}</div>
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
      </div>

      <!-- WeUI Tabs -->
      <div class="weui-tabs">
        <button 
          class="weui-tab" 
          :class="{ active: activeTab === 'static' }"
          @click="activeTab = 'static'"
        >
          {{ t('tabs.static') }}
        </button>
        <button 
          class="weui-tab" 
          :class="{ active: activeTab === 'video' }"
          @click="activeTab = 'video'"
        >
          {{ t('tabs.video') }}
        </button>
        <button 
          class="weui-tab" 
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          {{ t('tabs.history') }}
        </button>
        <button 
          class="weui-tab" 
          :class="{ active: activeTab === 'upload' }"
          @click="activeTab = 'upload'"
        >
          {{ t('tabs.upload') }}
        </button>
      </div>

      <!-- 内容面板 -->
      <div class="weui-panel" v-show="activeTab === 'static'">
        <StaticStickerPanel @converted="handleConverted" />
      </div>

      <div class="weui-panel" v-show="activeTab === 'video'">
        <VideoStickerPanel @converted="handleConverted" />
      </div>

      <div class="weui-panel" v-show="activeTab === 'history'">
        <HistoryPanel ref="historyRef" />
      </div>

      <div class="weui-panel" v-show="activeTab === 'upload'">
        <TelegramUploadPanel />
      </div>

      <PreviewModal />

      <footer>
        <p>
          {{ t('footer.text') }} <a href="https://core.telegram.org/stickers" target="_blank">{{ t('footer.link') }}</a>
        </p>
      </footer>
    </div>
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
/* WeUI 导航栏和语言切换样式已在 main.css 中定义 */
</style>
