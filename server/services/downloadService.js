import archiver from 'archiver'
import path from 'path'
import { logger } from '../utils/logger.js'
import config from '../config/index.js'

/**
 * 下载服务
 */
export class DownloadService {
  /**
   * 批量打包下载文件
   */
  async batchDownload(files, res) {
    const archive = archiver('zip', {
      zlib: { level: 9 }
    })

    // 设置响应头
    res.attachment(`stickers-${Date.now()}.zip`)
    res.type('application/zip')

    // 错误处理
    archive.on('error', err => {
      logger.error('Archive error:', err)
      throw err
    })

    // 管道输出到响应
    archive.pipe(res)

    // 添加文件到压缩包
    for (const file of files) {
      let filename = ''
      try {
        const urlObj = new URL(file.url, 'http://localhost')
        filename = path.basename(urlObj.pathname)
      } catch (e) {
        filename = path.basename(file.url || '')
      }
      try {
        filename = decodeURIComponent(filename)
      } catch (e) {
        // Ignore potential malformed URI errors
      }

      if (!filename) continue;

      const filePath = path.join(config.paths.temp, filename)
      try {
        archive.file(filePath, { name: file.name })
      } catch (error) {
        logger.warn(`Failed to add file to archive: ${file.name}`, error.message)
      }
    }

    // 完成打包
    await archive.finalize()

    logger.debug(`Batch download completed: ${files.length} files`)
  }
}

export default new DownloadService()
