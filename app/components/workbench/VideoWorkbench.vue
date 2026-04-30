<template>
  <div class="section-stack">
    <!-- FFmpeg 下载确认 -->
    <div v-if="showFfmpegPrompt" class="workbench-panel ffmpeg-prompt">
      <div class="workbench-header">
        <strong>需要加载视频处理组件</strong>
        <div class="text-secondary">首次使用需下载 FFmpeg WebAssembly (~30MB)，之后会缓存在浏览器中</div>
      </div>
      <div class="ffmpeg-actions">
        <button class="kv-action" type="button" @click="confirmLoadFfmpeg" :disabled="ffmpegLoading">
          {{ ffmpegLoading ? `加载中 ${loadProgress}%...` : '确认下载并加载' }}
        </button>
        <button class="kv-action secondary" type="button" @click="showFfmpegPrompt = false" :disabled="ffmpegLoading">取消</button>
      </div>
      <div v-if="ffmpegError" class="error-text">{{ ffmpegError }}</div>
    </div>

    <div class="workbench-panel">
      <div class="workbench-header">
        <div>
          <strong>动态贴纸转换</strong>
          <div class="text-secondary">GIF / MP4 / WEBM → WEBM VP9（客户端处理）</div>
        </div>
        <div class="chip">默认 3 秒</div>
      </div>
      <UploadZone
        title="拖拽视频到此处"
        hint="支持 GIF / MP4 / WEBM"
        accept="image/gif,video/mp4,video/webm"
        @files-selected="handleFilesSelected"
      />
    </div>

    <div v-if="tasks.length" class="workbench-panel">
      <div class="workbench-header">
        <strong>转换队列</strong>
        <div class="history-meta">
          <span>总计 {{ tasks.length }}</span>
          <span>完成 {{ doneCount }}</span>
        </div>
      </div>
      <div class="workbench-actions">
        <button class="kv-action" type="button" @click="convertAll" :disabled="pendingCount === 0 || converting">全部转换</button>
        <button class="kv-action secondary" type="button" @click="downloadAll" :disabled="doneCount === 0">下载 WEBM</button>
        <button class="kv-action secondary" type="button" @click="clearAll">清空</button>
      </div>

      <!-- 当前转换进度 -->
      <div v-if="converting" class="convert-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: convertProgress + '%' }"></div>
        </div>
        <div class="history-meta">
          <span>{{ convertLog || '转换中...' }}</span>
          <span>{{ convertProgress }}%</span>
        </div>
      </div>

      <div class="task-list">
        <article v-for="task in tasks" :key="task.id" class="task-card">
          <div class="task-preview" @click="openPreview(task)">
            <video :src="task.previewUrl" muted loop></video>
          </div>
          <div>
            <strong>{{ task.name }}</strong>
            <div class="history-meta">
              <span>{{ formatFileSize(task.file.size) }}</span>
              <span class="chip">{{ statusText(task.status) }}</span>
            </div>
            <div v-if="task.error" class="error-text">{{ task.error }}</div>
          </div>
          <div class="history-actions">
            <button class="kv-action secondary" type="button" @click="convertSingle(task)" :disabled="task.status === 'converting' || converting">转换</button>
            <button class="kv-action secondary" type="button" @click="downloadOne(task)" :disabled="!task.result?.blob">WEBM</button>
            <button class="kv-action secondary" type="button" @click="removeTask(task.id)">移除</button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import UploadZone from '@/components/ui/UploadZone.vue'
import { useHistoryStore } from '@/stores/history'
import { formatFileSize } from '@/utils/format'
import { useFfmpeg } from '@/composables/useFfmpeg'
import { useLightbox } from '@/composables/useLightbox'

interface VideoTask {
  id: string; file: File; name: string; previewUrl: string
  status: 'pending' | 'converting' | 'done' | 'error'
  result: { blob: Blob; url: string; filename: string; size: number } | null
  error: string
}

const statusText = (s: string) => ({ pending: '等待', converting: '转换中', done: '完成', error: '失败' }[s] || s)

const tasks = ref<VideoTask[]>([])
const limits = reactive({ maxVideoFiles: 100 })
const historyStore = useHistoryStore()
const lightbox = useLightbox()

const {
  loaded: ffmpegLoaded,
  loading: ffmpegLoading,
  loadProgress,
  error: ffmpegError,
  converting,
  convertProgress,
  convertLog,
  load: loadFfmpeg,
  convertToWebm,
  uploadConvertedFile
} = useFfmpeg()

const showFfmpegPrompt = ref(false)

onMounted(async () => {
  try {
    const res = await fetch('/api/config')
    if (res.ok) { const d = await res.json(); limits.maxVideoFiles = d.upload?.maxVideoFiles || limits.maxVideoFiles }
  } catch {}
})

onBeforeUnmount(() => { tasks.value.forEach(t => { if (t.previewUrl) URL.revokeObjectURL(t.previewUrl) }) })

const pendingCount = computed(() => tasks.value.filter(t => t.status === 'pending').length)
const doneCount = computed(() => tasks.value.filter(t => t.status === 'done').length)

const handleFilesSelected = (files: File[]) => {
  const valid = files.filter(f => ['image/gif', 'video/mp4', 'video/webm'].includes(f.type))
  if (!valid.length) return
  valid.slice(0, limits.maxVideoFiles).forEach(file => {
    tasks.value.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
      result: null,
      error: ''
    })
  })
}

const ensureFfmpeg = async (): Promise<boolean> => {
  if (ffmpegLoaded.value) return true
  showFfmpegPrompt.value = true
  // Wait for user to confirm
  return new Promise((resolve) => {
    const unwatch = setInterval(() => {
      if (ffmpegLoaded.value) { clearInterval(unwatch); resolve(true) }
      if (!showFfmpegPrompt.value && !ffmpegLoading.value) { clearInterval(unwatch); resolve(false) }
    }, 200)
  })
}

const confirmLoadFfmpeg = async () => {
  const success = await loadFfmpeg()
  if (success) showFfmpegPrompt.value = false
}

const convertSingle = async (task: VideoTask) => {
  if (!task || task.status === 'converting' || converting.value) return

  const ready = await ensureFfmpeg()
  if (!ready) return

  task.status = 'converting'; task.error = ''
  try {
    const result = await convertToWebm(task.file, 0, 3)
    if (!result) throw new Error(ffmpegError.value || '转换失败')

    // Create local URL for preview/download
    const blobUrl = URL.createObjectURL(result.blob)

    task.status = 'done'
    task.result = {
      blob: result.blob,
      url: blobUrl,
      filename: result.filename,
      size: result.size
    }

    // Upload to server for Telegram integration
    await uploadConvertedFile(result.blob, result.filename)

    historyStore.add({
      type: 'video',
      fileName: task.name.replace(/\.[^.]+$/, ''),
      preview: blobUrl,
      duration: result.duration,
      size: task.file.size,
      result: { webm: blobUrl }
    })
  } catch (error: any) {
    task.status = 'error'
    task.error = error.message || '转换失败'
  }
}

const convertAll = async () => {
  const ready = await ensureFfmpeg()
  if (!ready) return
  for (const t of tasks.value.filter(i => i.status === 'pending')) {
    await convertSingle(t)
  }
}

const downloadOne = (task: VideoTask) => {
  if (!task.result?.blob) return
  const a = document.createElement('a')
  a.href = task.result.url
  a.download = `${task.name.replace(/\.[^.]+$/, '')}.webm`
  a.click()
}

const downloadAll = async () => {
  const done = tasks.value.filter(t => t.status === 'done' && t.result?.blob)
  if (!done.length) return

  // Download individually since we have blobs client-side
  for (const task of done) {
    downloadOne(task)
    await new Promise(r => setTimeout(r, 200))
  }
}

const removeTask = (id: string) => {
  const t = tasks.value.find(t => t.id === id)
  if (t?.previewUrl) URL.revokeObjectURL(t.previewUrl)
  if (t?.result?.url) URL.revokeObjectURL(t.result.url)
  tasks.value = tasks.value.filter(t => t.id !== id)
}

const clearAll = () => {
  tasks.value.forEach(t => {
    if (t.previewUrl) URL.revokeObjectURL(t.previewUrl)
    if (t.result?.url) URL.revokeObjectURL(t.result.url)
  })
  tasks.value = []
}

const openPreview = (task: VideoTask) => {
  lightbox.openVideo(task.previewUrl, task.name, formatFileSize(task.file.size))
}
</script>

<style scoped>
.ffmpeg-prompt {
  border-color: var(--color-warning);
}
.ffmpeg-actions {
  display: flex;
  gap: var(--gap-sm);
  margin-top: var(--gap-sm);
}
.convert-progress {
  margin-top: var(--gap-md);
}
.progress-bar {
  height: 4px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: var(--color-accent);
  transition: width 0.2s ease;
}
</style>
