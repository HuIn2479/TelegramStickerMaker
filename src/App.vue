<template>
  <div class="container">
    <header>
      <h1>Telegram Sticker Maker</h1>
      <p class="subtitle">将图片或视频转换为 Telegram 贴纸格式</p>
    </header>

    <div class="tabs">
      <button 
        class="tab" 
        :class="{ active: activeTab === 'static' }"
        @click="activeTab = 'static'"
      >
        静态贴纸
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'video' }"
        @click="activeTab = 'video'"
      >
        视频贴纸
      </button>
      <button 
        class="tab" 
        :class="{ active: activeTab === 'history' }"
        @click="activeTab = 'history'"
      >
        历史记录
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

    <PreviewModal />

    <footer>
      <p>
        基于 <a href="https://core.telegram.org/stickers" target="_blank">Telegram Sticker 规范</a>
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StaticStickerPanel from './components/StaticStickerPanel.vue'
import VideoStickerPanel from './components/VideoStickerPanel.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import PreviewModal from './components/PreviewModal.vue'

const activeTab = ref('static')
const historyRef = ref(null)

const handleConverted = () => {
  // 转换完成后刷新历史记录
  if (historyRef.value) {
    historyRef.value.loadHistory()
  }
}
</script>
