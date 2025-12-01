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
