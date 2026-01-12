import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import config from '../config/index.js'
import { logger } from '../utils/logger.js'
import { safeDeleteFile } from '../utils/fileCleanup.js'
import { ProgressTracker } from '../utils/progressTracker.js'
import wsManager from '../utils/websocket.js'

/**
 * 视频转换服务
 */
export class VideoService {
  /**
   * 获取视频信息
   */
  getVideoInfo(filePath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(filePath, (err, metadata) => {
        if (err) {
          reject(err)
          return
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video')
        resolve({
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          duration: metadata.format?.duration || 0
        })
      })
    })
  }

  /**
   * 转换视频为 WEBM 格式
   */
  convertToWebm(inputPath, outputPath, scale, startTime = 0, duration = 3, highCompression = false, onProgress = null) {
    return new Promise((resolve, reject) => {
      const bitrate = highCompression ? '150k' : '400k'
      const crf = highCompression ? 45 : 30

      ffmpeg(inputPath)
        .setStartTime(startTime)
        .duration(duration)
        .videoCodec('libvpx-vp9')
        .outputOptions([
          `-vf scale=${scale},setsar=1`,
          '-r 30',
          '-an',
          '-pix_fmt yuva420p',
          '-auto-alt-ref 0',
          `-b:v ${bitrate}`,
          `-crf ${crf}`
        ])
        .output(outputPath)
        .on('progress', progress => {
          if (onProgress && progress.percent) {
            onProgress(progress.percent)
          }
        })
        .on('end', resolve)
        .on('error', reject)
        .run()
    })
  }

  /**
   * 转换视频为贴纸格式
   */
  async convertToSticker(inputPath, originalFilename, startTime = 0, endTime = 3, taskId = null) {
    const tracker = taskId ? new ProgressTracker(taskId, wsManager, 100) : null
    const outputFilename = `${path.basename(originalFilename, path.extname(originalFilename))}-${Date.now()}.webm`
    const outputPath = path.join(config.paths.temp, outputFilename)

    // 计算时长（最多3秒）
    const duration = Math.min(endTime - startTime, config.sticker.maxVideoDuration)

    try {
      tracker?.update(5, '读取视频信息...')

      // 获取输入视频信息
      const inputInfo = await this.getVideoInfo(inputPath)

      tracker?.update(10, '计算缩放参数...')

      // 计算缩放参数
      const scale = inputInfo.width >= inputInfo.height ? '512:-2' : '-2:512'

      tracker?.update(15, '开始转换视频...')

      // 转换视频（带进度回调）
      await this.convertToWebm(inputPath, outputPath, scale, startTime, duration, false, percent => {
        const progress = 15 + Math.round(percent * 0.6) // 15-75%
        tracker?.update(progress, `转换中... ${Math.round(percent)}%`)
      })

      tracker?.update(80, '检查文件大小...')

      // 检查文件大小
      let outputStats = fs.statSync(outputPath)

      // 如果超过限制，使用更高压缩
      if (outputStats.size > config.sticker.maxVideoFileSize) {
        logger.debug(`Video size ${outputStats.size} exceeds limit, applying high compression`)
        tracker?.update(85, '文件过大，重新压缩...')
        await this.convertToWebm(inputPath, outputPath, scale, startTime, duration, true, percent => {
          const progress = 85 + Math.round(percent * 0.1) // 85-95%
          tracker?.update(progress, `高压缩中... ${Math.round(percent)}%`)
        })
        outputStats = fs.statSync(outputPath)
      }

      tracker?.update(95, '获取输出信息...')

      // 获取输出视频信息
      const outputInfo = await this.getVideoInfo(outputPath)

      tracker?.update(100, '完成转换')

      // 删除原始文件
      safeDeleteFile(inputPath)

      logger.debug(`Video converted: ${originalFilename} -> ${outputStats.size} bytes`)

      const result = {
        original: {
          width: inputInfo.width,
          height: inputInfo.height,
          duration: inputInfo.duration
        },
        result: {
          width: outputInfo.width,
          height: outputInfo.height,
          duration: outputInfo.duration,
          size: outputStats.size,
          filename: outputFilename,
          path: outputPath,
          sizeValid: outputStats.size <= config.sticker.maxVideoFileSize
        }
      }

      tracker?.complete(result)
      return result
    } catch (error) {
      // 清理文件
      safeDeleteFile(inputPath)
      safeDeleteFile(outputPath)
      logger.error('Video conversion failed:', error)
      tracker?.error(error)
      throw error
    }
  }
}

export default new VideoService()
