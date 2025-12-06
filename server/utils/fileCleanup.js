import fs from 'fs'
import path from 'path'
import { logger } from './logger.js'

/**
 * 清理过期文件
 */
export function cleanupOldFiles(directory, maxAge) {
  if (!fs.existsSync(directory)) {
    return
  }

  try {
    const now = Date.now()
    const files = fs.readdirSync(directory)
    let deletedCount = 0

    files.forEach(file => {
      const filePath = path.join(directory, file)
      try {
        const stats = fs.statSync(filePath)
        const age = now - stats.mtimeMs

        if (age > maxAge) {
          fs.unlinkSync(filePath)
          deletedCount++
        }
      } catch (err) {
        logger.warn(`Failed to process file ${file}:`, err.message)
      }
    })

    if (deletedCount > 0) {
      logger.info(`Cleaned up ${deletedCount} old files from ${path.basename(directory)}`)
    }
  } catch (error) {
    logger.error(`Error cleaning directory ${directory}:`, error.message)
  }
}

/**
 * 启动定时清理任务
 */
export function startCleanupSchedule(directories, maxAge, interval) {
  // 立即执行一次清理
  directories.forEach(dir => cleanupOldFiles(dir, maxAge))

  // 定期清理
  setInterval(() => {
    directories.forEach(dir => cleanupOldFiles(dir, maxAge))
  }, interval)

  logger.info(`File cleanup scheduled every ${interval / 1000 / 60} minutes`)
}

/**
 * 安全删除文件（延迟删除，避免文件锁定）
 */
export function safeDeleteFile(filePath, delay = 1000) {
  setTimeout(() => {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (error) {
      logger.warn(`Failed to delete file ${filePath}:`, error.message)
    }
  }, delay)
}

export default {
  cleanupOldFiles,
  startCleanupSchedule,
  safeDeleteFile
}
