<template>
  <div class="page-shell">
    <div class="kv-container">
      <header class="nav-bar">
        <div class="nav-brand">
          <img class="nav-mark" src="/icon.png" alt="Logo" />
          <div>
            <div class="nav-title">Telegram Sticker Maker</div>
            <div class="nav-subtitle">贴纸制作与上传工具</div>
          </div>
        </div>
        <div class="nav-right">
          <button class="theme-toggle" type="button" @click="cycleTheme" :aria-label="themeLabel">
            <svg v-if="theme === 'system'" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <svg v-else-if="theme === 'light'" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <span class="theme-label">{{ themeLabel }}</span>
          </button>
        </div>
      </header>
      <slot />
    </div>
  </div>
  <Lightbox ref="lightboxRef" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Lightbox from '@/components/ui/Lightbox.vue'
import { useLightbox } from '@/composables/useLightbox'

const lightboxRef = ref()
const { setRef } = useLightbox()

onMounted(() => { setRef(lightboxRef.value) })

type ThemeMode = 'system' | 'light' | 'dark'

const theme = ref<ThemeMode>('system')
const isDark = ref(false)

const themeLabel = computed(() => ({
  system: '跟随系统',
  light: '浅色',
  dark: '深色'
}[theme.value]))

const applyTheme = (mode: ThemeMode) => {
  if (mode === 'system') {
    document.documentElement.removeAttribute('data-theme')
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  } else {
    document.documentElement.setAttribute('data-theme', mode)
    isDark.value = mode === 'dark'
  }
}

const cycleTheme = () => {
  theme.value = theme.value === 'system' ? 'light' : theme.value === 'light' ? 'dark' : 'system'
  localStorage.setItem('theme', theme.value)
  applyTheme(theme.value)
}

onMounted(() => {
  const saved = localStorage.getItem('theme') as ThemeMode | null
  theme.value = saved && ['system', 'light', 'dark'].includes(saved) ? saved : 'system'
  applyTheme(theme.value)

  // Listen for system theme changes when in system mode
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme.value === 'system') applyTheme('system')
  })
})
</script>

<style scoped>
.nav-right {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: var(--radius-full);
  border: none;
  background: var(--color-bg-subtle);
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);
  white-space: nowrap;
}

.theme-toggle:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.theme-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.theme-label {
  line-height: 1;
}

@media (max-width: 480px) {
  .theme-label {
    display: none;
  }
  .theme-toggle {
    padding: 8px;
  }
}
</style>
