/**
 * 环境检测工具
 */

let uploadLimitsPromise = null

/**
 * 获取 API 基础 URL
 */
export function getApiBaseUrl() {
  // 开发环境使用相对路径或指定的 API URL
  if (import.meta.env.DEV) {
    return 'http://localhost:3000'
  }
  // 生产环境使用相对路径
  return ''
}

/**
 * 检测后端 API 是否可用
 */
export async function isAPIAvailable() {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      timeout: 3000
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * 获取上传数量限制配置
 */
export function getUploadLimits() {
  return {
    maxImageFiles: 200,
    maxVideoFiles: 100,
    maxFileSize: 52428800 // 50MB
  }
}

/**
 * 从后端获取上传限制配置（失败时回退到默认值）
 */
export async function fetchUploadLimits() {
  if (!uploadLimitsPromise) {
    uploadLimitsPromise = fetch('/api/config')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch /api/config')
        }
        return response.json()
      })
      .then(data => {
        const upload = data?.upload || {}
        const fallback = getUploadLimits()
        return {
          maxImageFiles: Number.isFinite(upload.maxImageFiles) ? upload.maxImageFiles : fallback.maxImageFiles,
          maxVideoFiles: Number.isFinite(upload.maxVideoFiles) ? upload.maxVideoFiles : fallback.maxVideoFiles,
          maxFileSize: Number.isFinite(upload.maxFileSize) ? upload.maxFileSize : fallback.maxFileSize
        }
      })
      .catch(() => {
        return getUploadLimits()
      })
  }

  return uploadLimitsPromise
}
