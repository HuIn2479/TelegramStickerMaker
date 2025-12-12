/**
 * 格式化文件大小
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 生成唯一ID
 */
let idCounter = 0
export function generateId() {
  // 使用时间戳 + 随机数 + 计数器确保唯一性
  idCounter = (idCounter + 1) % 10000
  return `${Date.now()}-${idCounter}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 获取状态文本
 */
export function getStatusText(status) {
  const map = {
    pending: '待转换',
    converting: '转换中',
    done: '完成',
    error: '失败'
  }
  return map[status] || status
}

/**
 * 下载文件
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a')
  link.download = filename
  link.href = url
  link.click()
}

/**
 * 历史记录管理
 */
const HISTORY_KEY = 'sticker_history'
const HISTORY_EXPIRY = 24 * 60 * 60 * 1000 // 24小时

export function saveToHistory(item) {
  const history = getHistory()
  history.unshift({
    ...item,
    id: generateId(), // 为历史记录生成新的唯一 ID
    timestamp: Date.now()
  })
  // 只保留最近50条
  const validHistory = history.slice(0, 50)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(validHistory))
}

export function getHistory() {
  try {
    const data = localStorage.getItem(HISTORY_KEY)
    if (!data) return []

    const history = JSON.parse(data)
    const now = Date.now()

    // 过滤掉24小时前的记录
    const validHistory = history.filter(item => {
      return now - item.timestamp < HISTORY_EXPIRY
    })

    // 更新存储
    if (validHistory.length !== history.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(validHistory))
    }

    return validHistory
  } catch (e) {
    return []
  }
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY)
}
