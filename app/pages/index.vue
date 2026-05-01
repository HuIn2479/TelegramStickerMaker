<template>
  <main class="section-stack">
    <KvHero />

    <!-- FFmpeg 不可用提示 -->
    <div v-if="showFfmpegNotice && !ffmpegAvailable" class="workbench-panel notice-banner">
      <div class="notice-content">
        <div class="notice-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <div class="notice-text">
          <strong>动态贴纸功能不可用</strong>
          <div class="text-secondary">
            服务器未安装 FFmpeg，无法进行视频转换。仅静态贴纸可用。
            <br />如需动态贴纸，请在部署环境中安装 FFmpeg。
          </div>
        </div>
        <button class="notice-close" type="button" @click="showFfmpegNotice = false" aria-label="关闭">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <WorkbenchShell>
      <template #tabs>
        <SegmentedTabs v-model="activeTab" :items="tabs" />
      </template>

      <ImageWorkbench v-if="activeTab === 'image'" />
      <VideoWorkbench v-else-if="activeTab === 'video'" />
      <TelegramWorkbench v-else-if="activeTab === 'telegram'" />
      <HistoryPanel v-else />
    </WorkbenchShell>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import KvHero from '@/components/kv/KvHero.vue'
import WorkbenchShell from '@/components/workbench/WorkbenchShell.vue'
import SegmentedTabs from '@/components/ui/SegmentedTabs.vue'
import HistoryPanel from '@/components/history/HistoryPanel.vue'
import ImageWorkbench from '@/components/workbench/ImageWorkbench.vue'
import VideoWorkbench from '@/components/workbench/VideoWorkbench.vue'
import TelegramWorkbench from '@/components/workbench/TelegramWorkbench.vue'

const ffmpegAvailable = ref(true)
const ffmpegVersion = ref<string | null>(null)
const showFfmpegNotice = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/ffmpeg-check')
    if (res.ok) {
      const data = await res.json()
      ffmpegAvailable.value = data.available
      ffmpegVersion.value = data.version
    }
  } catch {
    ffmpegAvailable.value = false
  }
})

const tabs = computed(() => {
  const items = [
    { key: 'image', label: '静态贴纸' },
    ...(ffmpegAvailable.value ? [{ key: 'video', label: '动态贴纸' }] : []),
    { key: 'telegram', label: 'Telegram' },
    { key: 'history', label: '历史记录' }
  ]
  return items
})

const activeTab = ref('image')
</script>

<style scoped>
.notice-banner {
  border-color: var(--color-warning);
  background: var(--color-warning-light);
}

.notice-content {
  display: flex;
  align-items: flex-start;
  gap: var(--gap-sm);
}

.notice-icon {
  flex-shrink: 0;
  color: var(--color-warning);
  margin-top: 2px;
}

.notice-text {
  flex: 1;
  min-width: 0;
  display: grid;
  gap: 4px;
}

.notice-text strong {
  font-size: 0.9rem;
  color: var(--color-text);
}

.notice-text .text-secondary {
  font-size: 0.8rem;
  line-height: 1.5;
}

.notice-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  color: var(--color-text-tertiary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.notice-close:hover {
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-text);
}
</style>
