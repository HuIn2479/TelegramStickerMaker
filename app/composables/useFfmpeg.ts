import { ref } from 'vue'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const ffmpegRef = ref<FFmpeg | null>(null)
const loaded = ref(false)
const loading = ref(false)
const loadProgress = ref(0)
const error = ref('')
const converting = ref(false)
const convertProgress = ref(0)
const convertLog = ref('')

export function useFfmpeg() {
  const load = async (): Promise<boolean> => {
    if (loaded.value && ffmpegRef.value) return true
    if (loading.value) return false

    // Check SharedArrayBuffer availability (required by ffmpeg.wasm)
    if (typeof SharedArrayBuffer === 'undefined') {
      if (typeof window !== 'undefined' && !window.crossOriginIsolated) {
        error.value = '页面未启用跨域隔离，无法使用视频转换功能。请刷新页面重试。'
      } else {
        error.value = '当前浏览器不支持 SharedArrayBuffer，请使用最新版 Chrome/Firefox/Edge'
      }
      return false
    }

    loading.value = true
    error.value = ''
    loadProgress.value = 0

    try {
      const ffmpeg = new FFmpeg()

      ffmpeg.on('log', ({ message }: { message: string }) => {
        convertLog.value = message
      })

      ffmpeg.on('progress', ({ progress }: { progress: number }) => {
        convertProgress.value = Math.round(progress * 100)
      })

      const baseURL = '/ffmpeg'
      const CACHE_NAME = 'ffmpeg-wasm-cache'

      const cachedFetch = async (url: string, mimeType: string): Promise<string> => {
        try {
          const cache = await caches.open(CACHE_NAME)
          const cached = await cache.match(url)
          if (cached) {
            const blob = await cached.blob()
            return URL.createObjectURL(blob)
          }
          const response = await fetch(url)
          await cache.put(url, response.clone())
          const blob = await response.blob()
          return URL.createObjectURL(blob)
        } catch {
          // Fallback to direct toBlobURL if Cache API unavailable
          return toBlobURL(url, mimeType)
        }
      }

      const [coreURL, wasmURL] = await Promise.all([
        cachedFetch(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        cachedFetch(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      ])

      await ffmpeg.load({ coreURL, wasmURL })

      ffmpegRef.value = ffmpeg
      loaded.value = true
      return true
    } catch (e: any) {
      error.value = e.message || '加载 FFmpeg 失败'
      return false
    } finally {
      loading.value = false
    }
  }

  const getVideoDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.onloadedmetadata = () => {
        resolve({ width: video.videoWidth, height: video.videoHeight })
        URL.revokeObjectURL(video.src)
      }
      video.onerror = () => {
        resolve({ width: 512, height: 512 })
        URL.revokeObjectURL(video.src)
      }
      video.src = URL.createObjectURL(file)
    })
  }

  const convertToWebm = async (
    inputFile: File,
    startTime = 0,
    duration = 3
  ): Promise<{ blob: Blob; filename: string; width: number; height: number; duration: number; size: number } | null> => {
    if (!ffmpegRef.value || !loaded.value) {
      error.value = 'FFmpeg 未加载'
      return null
    }

    converting.value = true
    convertProgress.value = 0
    error.value = ''
    convertLog.value = ''

    try {
      const ffmpeg = ffmpegRef.value!
      const inputName = 'input' + getExt(inputFile.name)
      const outputName = 'output.webm'

      await ffmpeg.writeFile(inputName, await fetchFile(inputFile))

      await ffmpeg.exec([
        '-i', inputName,
        '-ss', String(startTime),
        '-t', String(duration),
        '-vf', 'scale=512:-2',
        '-r', '30',
        '-an',
        '-pix_fmt', 'yuva420p',
        '-c:v', 'libvpx-vp9',
        '-b:v', '400k',
        '-crf', '30',
        '-auto-alt-ref', '0',
        outputName
      ])

      let data = await ffmpeg.readFile(outputName)
      let blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/webm' })

      // 如果超过 256KB，高压缩重新编码
      if (blob.size > 256 * 1024) {
        convertLog.value = '文件过大，重新压缩...'
        await ffmpeg.exec([
          '-i', inputName,
          '-ss', String(startTime),
          '-t', String(duration),
          '-vf', 'scale=512:-2',
          '-r', '30',
          '-an',
          '-pix_fmt', 'yuva420p',
          '-c:v', 'libvpx-vp9',
          '-b:v', '150k',
          '-crf', '45',
          '-auto-alt-ref', '0',
          outputName
        ])
        data = await ffmpeg.readFile(outputName)
        blob = new Blob([new Uint8Array(data as Uint8Array)], { type: 'video/webm' })
      }

      await ffmpeg.deleteFile(inputName)
      await ffmpeg.deleteFile(outputName)

      const baseName = inputFile.name.replace(/\.[^.]+$/, '')
      const safeName = baseName.replace(/[^\w.-]/g, '_').slice(0, 40)

      // Compute output dimensions from input
      const inputDims = await getVideoDimensions(inputFile)
      let outWidth = 512, outHeight = 512
      if (inputDims.width >= inputDims.height) {
        outWidth = 512
        outHeight = Math.round((inputDims.height / inputDims.width) * 512)
        if (outHeight % 2 !== 0) outHeight -= 1
      } else {
        outHeight = 512
        outWidth = Math.round((inputDims.width / inputDims.height) * 512)
        if (outWidth % 2 !== 0) outWidth -= 1
      }

      return {
        blob,
        filename: `${safeName}-${Date.now()}.webm`,
        width: outWidth,
        height: outHeight,
        duration,
        size: blob.size
      }
    } catch (e: any) {
      error.value = e.message || '转换失败'
      return null
    } finally {
      converting.value = false
    }
  }

  const uploadConvertedFile = async (blob: Blob, filename: string): Promise<boolean> => {
    try {
      const formData = new FormData()
      formData.append('file', blob, filename)
      const res = await fetch('/api/upload-converted', { method: 'POST', body: formData })
      return res.ok
    } catch {
      return false
    }
  }

  return {
    loaded,
    loading,
    loadProgress,
    error,
    converting,
    convertProgress,
    convertLog,
    load,
    convertToWebm,
    uploadConvertedFile
  }
}

function getExt(name: string): string {
  const match = name.match(/\.[^.]+$/)
  return match ? match[0] : '.mp4'
}
