import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import config from '../config/index.js'
import { logger } from '../utils/logger.js'
import { safeDeleteFile } from '../utils/fileCleanup.js'
import { ProgressTracker } from '../utils/progressTracker.js'
import wsManager from '../utils/websocket.js'

/**
 * 图片转换服务
 */
export class ImageService {
  /**
   * 转换图片为贴纸格式
   */
  async convertToSticker(inputPath, originalFilename, taskId = null) {
    const tracker = taskId ? new ProgressTracker(taskId, wsManager, 5) : null
    try {
      tracker?.update(1, '读取图片信息...')

      // 获取原始图片信息
      const metadata = await sharp(inputPath).metadata()
      const { width: originalWidth, height: originalHeight } = metadata

      tracker?.update(2, '计算缩放尺寸...')

      // 计算新尺寸
      const { newWidth, newHeight } = this.calculateDimensions(originalWidth, originalHeight)

      // 生成输出文件名
      const timestamp = Date.now()
      const baseName = path.basename(originalFilename, path.extname(originalFilename))
      const outputFilename = `${baseName}-${timestamp}`
      const pngPath = path.join(config.paths.temp, `${outputFilename}.png`)
      const webpPath = path.join(config.paths.temp, `${outputFilename}.webp`)

      tracker?.update(3, '转换为 PNG 格式...')

      // 转换为 PNG
      await sharp(inputPath)
        .resize(newWidth, newHeight, { fit: 'fill' })
        .png({ compressionLevel: config.sticker.imageQuality.png })
        .toFile(pngPath)

      tracker?.update(4, '转换为 WEBP 格式...')

      // 转换为 WEBP
      await sharp(inputPath)
        .resize(newWidth, newHeight, { fit: 'fill' })
        .webp({ quality: config.sticker.imageQuality.webp })
        .toFile(webpPath)

      tracker?.update(5, '完成转换')

      // 获取输出文件大小
      const pngStats = fs.statSync(pngPath)
      const webpStats = fs.statSync(webpPath)

      // 删除原始文件
      safeDeleteFile(inputPath)

      logger.debug(`Image converted: ${originalFilename} -> PNG: ${pngStats.size}, WEBP: ${webpStats.size}`)

      const result = {
        original: {
          width: originalWidth,
          height: originalHeight
        },
        result: {
          width: newWidth,
          height: newHeight,
          png: {
            filename: `${outputFilename}.png`,
            path: pngPath,
            size: pngStats.size
          },
          webp: {
            filename: `${outputFilename}.webp`,
            path: webpPath,
            size: webpStats.size
          }
        }
      }

      tracker?.complete(result)
      return result
    } catch (error) {
      // 清理文件
      safeDeleteFile(inputPath)
      logger.error('Image conversion failed:', error)
      tracker?.error(error)
      throw error
    }
  }

  /**
   * 计算缩放后的尺寸
   */
  calculateDimensions(width, height) {
    const maxSize = config.sticker.maxSize
    let newWidth, newHeight

    if (width >= height) {
      newWidth = maxSize
      newHeight = Math.round((height / width) * maxSize)
    } else {
      newHeight = maxSize
      newWidth = Math.round((width / height) * maxSize)
    }

    return { newWidth, newHeight }
  }
}

export default new ImageService()
