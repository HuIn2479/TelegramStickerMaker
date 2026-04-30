import fs from 'fs'
import path from 'path'
import { config } from '../../utils/config'
import { telegramService } from '../../services/telegramService'
import { logger } from '../../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { botToken, userId, packName, packTitle, emoji, files } = body

    if (!botToken) {
      throw createError({ statusCode: 400, message: 'Bot token is required' })
    }
    if (!userId) {
      throw createError({ statusCode: 400, message: 'User ID is required' })
    }
    if (!packName) {
      throw createError({ statusCode: 400, message: 'Pack name is required' })
    }
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw createError({ statusCode: 400, message: 'At least one file is required' })
    }

    const tempDir = config.paths.temp
    const validFiles: string[] = []

    for (const file of files) {
      const filePath = path.join(tempDir, file)
      if (fs.existsSync(filePath)) {
        const ext = path.extname(file).toLowerCase()
        if (ext === '.webp' || ext === '.webm') {
          validFiles.push(filePath)
        }
      }
    }

    if (validFiles.length === 0) {
      throw createError({ statusCode: 400, message: 'No valid sticker files found' })
    }

    logger.info(`Starting upload of ${validFiles.length} stickers to Telegram`)

    const results = await telegramService.batchUploadStickers(
      botToken,
      userId,
      packName,
      packTitle || 'My Sticker Pack',
      validFiles,
      emoji || '😊'
    )

    logger.info(`Upload complete: ${results.success.length} success, ${results.failed.length} failed`)

    return {
      results: {
        success: results.success.length,
        failed: results.failed.length,
        failedFiles: results.failed
      },
      packUrl: results.packUrl,
      packName: results.packName
    }
  } catch (error: any) {
    logger.error('Upload error:', error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message || 'Upload failed' })
  }
})
