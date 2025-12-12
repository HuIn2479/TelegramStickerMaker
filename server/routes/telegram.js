/**
 * Telegram Upload Routes
 * 处理贴纸包上传到 Telegram 的 API 路由
 */

import express from 'express'
import path from 'path'
import fs from 'fs'
import config from '../config/index.js'
import { logger } from '../utils/logger.js'
import telegramService from '../services/telegramService.js'
import wsManager from '../utils/websocket.js'

const router = express.Router()

/**
 * POST /api/telegram/validate
 * 验证 Bot Token
 */
router.post('/telegram/validate', async (req, res) => {
  try {
    const { botToken } = req.body

    if (!botToken) {
      return res.status(400).json({ error: 'Bot token is required' })
    }

    const result = await telegramService.validateBotToken(botToken)

    if (result.valid) {
      res.json({
        valid: true,
        bot: {
          id: result.bot.id,
          username: result.bot.username,
          firstName: result.bot.first_name
        }
      })
    } else {
      res.status(400).json({ valid: false, error: result.error })
    }
  } catch (error) {
    logger.error('Token validation error:', error)
    res.status(500).json({ error: 'Failed to validate token' })
  }
})

/**
 * POST /api/telegram/check-pack
 * 检查贴纸包是否存在
 */
router.post('/telegram/check-pack', async (req, res) => {
  try {
    const { botToken, packName } = req.body

    if (!botToken || !packName) {
      return res.status(400).json({ error: 'Bot token and pack name are required' })
    }

    // 获取机器人信息
    const botInfo = await telegramService.getBotInfo(botToken)
    const fullPackName = `${packName}_by_${botInfo.username}`

    // 检查贴纸包
    const stickerSet = await telegramService.getStickerSet(botToken, fullPackName)

    if (stickerSet) {
      res.json({
        exists: true,
        packName: fullPackName,
        title: stickerSet.title,
        stickerCount: stickerSet.stickers.length,
        packUrl: `https://t.me/addstickers/${fullPackName}`
      })
    } else {
      res.json({
        exists: false,
        packName: fullPackName
      })
    }
  } catch (error) {
    logger.error('Check pack error:', error)
    res.status(500).json({ error: error.message })
  }
})

/**
 * POST /api/telegram/upload
 * 批量上传贴纸到 Telegram
 */
router.post('/telegram/upload', async (req, res) => {
  try {
    const { botToken, userId, packName, packTitle, emoji, files } = req.body

    // 验证必需参数
    if (!botToken) {
      return res.status(400).json({ error: 'Bot token is required' })
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }
    if (!packName) {
      return res.status(400).json({ error: 'Pack name is required' })
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: 'At least one file is required' })
    }

    // 验证文件存在
    const outputDir = config.paths.output
    const validFiles = []

    for (const file of files) {
      const filePath = path.join(outputDir, file)
      if (fs.existsSync(filePath)) {
        const ext = path.extname(file).toLowerCase()
        if (ext === '.webp' || ext === '.webm') {
          validFiles.push(filePath)
        }
      }
    }

    if (validFiles.length === 0) {
      return res.status(400).json({ error: 'No valid sticker files found' })
    }

    logger.info(`Starting upload of ${validFiles.length} stickers to Telegram`)

    // 生成上传任务 ID
    const uploadId = `upload_${Date.now()}`

    // 立即返回响应，上传在后台进行
    res.json({
      uploadId,
      message: 'Upload started',
      totalFiles: validFiles.length
    })

    // 异步执行上传
    const results = await telegramService.batchUploadStickers(
      botToken,
      userId,
      packName,
      packTitle || 'My Sticker Pack',
      validFiles,
      emoji || '😊',
      progress => {
        // 通过 WebSocket 发送进度
        wsManager.broadcast({
          type: 'telegram_upload_progress',
          uploadId,
          ...progress
        })
      }
    )

    // 发送完成通知
    wsManager.broadcast({
      type: 'telegram_upload_complete',
      uploadId,
      results: {
        success: results.success.length,
        failed: results.failed.length,
        packUrl: results.packUrl,
        packName: results.packName,
        failedFiles: results.failed
      }
    })

    logger.info(`Upload complete: ${results.success.length} success, ${results.failed.length} failed`)
  } catch (error) {
    logger.error('Upload error:', error)

    // 如果还没发送响应
    if (!res.headersSent) {
      res.status(500).json({ error: error.message })
    } else {
      // 通过 WebSocket 发送错误
      wsManager.broadcast({
        type: 'telegram_upload_error',
        error: error.message
      })
    }
  }
})

/**
 * GET /api/telegram/output-files
 * 获取 output 目录中的贴纸文件列表
 */
router.get('/telegram/output-files', (req, res) => {
  try {
    const outputDir = config.paths.output

    if (!fs.existsSync(outputDir)) {
      return res.json({ files: [] })
    }

    const files = fs
      .readdirSync(outputDir)
      .filter(file => {
        const ext = path.extname(file).toLowerCase()
        return ext === '.webp' || ext === '.webm'
      })
      .map(file => {
        const filePath = path.join(outputDir, file)
        const stats = fs.statSync(filePath)
        const ext = path.extname(file).toLowerCase()
        return {
          name: file,
          type: ext === '.webm' ? 'video' : 'static',
          size: stats.size,
          mtime: stats.mtime
        }
      })
      .sort((a, b) => b.mtime - a.mtime)

    res.json({ files, total: files.length })
  } catch (error) {
    logger.error('Get output files error:', error)
    res.status(500).json({ error: 'Failed to list output files' })
  }
})

export default router
