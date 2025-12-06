/**
 * 环境检测工具
 */

/**
 * 检测是否在 GitHub Pages 环境
 */
export function isGitHubPages() {
  return window.location.hostname.includes('github.io') || 
         window.location.hostname.includes('github.com')
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
 * 注意：这些值应该与后端 .env 配置保持一致
 */
export function getUploadLimits() {
  // 从环境变量读取，如果没有则使用默认值
  // 生产环境中这些值会被 Vite 在构建时替换
  return {
    maxImageFiles: parseInt(import.meta.env.VITE_MAX_IMAGE_FILES || '20', 10),
    maxVideoFiles: parseInt(import.meta.env.VITE_MAX_VIDEO_FILES || '10', 10),
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '52428800', 10)
  }
}
