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
 * 检测是否在静态托管环境（没有后端服务器）
 */
export function isStaticHosting() {
  // 检测常见的静态托管服务
  const staticHosts = [
    'github.io',
    'github.com',
    'netlify.app',
    'vercel.app',
    'surge.sh',
    'pages.dev', // Cloudflare Pages
    'web.app',   // Firebase Hosting
    'firebaseapp.com'
  ]
  
  return staticHosts.some(host => window.location.hostname.includes(host))
}

/**
 * 检测是否应该强制使用本地处理模式
 */
export function shouldForceLocalMode() {
  return isStaticHosting()
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
