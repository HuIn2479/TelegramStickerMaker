/**
 * 环境检测工具
 */

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
 * 检测是否在 GitHub Pages 环境
 */
export function isGitHubPages() {
  return window.location.hostname.includes('github.io') || window.location.hostname.includes('github.com')
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
    maxImageFiles: 20,
    maxVideoFiles: 10,
    maxFileSize: 52428800 // 50MB
  }
}
