/**
 * Telegram Bot API Service
 * 处理与 Telegram Bot API 的所有交互
 */

import fs from 'fs'
import path from 'path'
import { logger } from '../utils/logger.js'

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot'

/**
 * 解析 Telegram API 响应
 */
async function parseResponse(response, method) {
  let responseText
  try {
    responseText = await response.text()
  } catch (textError) {
    logger.error(`Failed to read response text for ${method}: ${textError.message}`)
    return {
      ok: false,
      description: `Failed to read response: ${textError.message}`
    }
  }

  logger.info(`Telegram API ${method} response (status: ${response.status}): ${responseText.substring(0, 500)}`)

  if (!responseText || responseText.trim() === '') {
    logger.error(`Empty response from Telegram API for method ${method}, status: ${response.status}`)
    return {
      ok: false,
      description: `Empty response from Telegram (HTTP ${response.status})`
    }
  }

  try {
    return JSON.parse(responseText)
  } catch (parseError) {
    logger.error(`Failed to parse Telegram API response for ${method}: ${responseText.substring(0, 500)}`)
    return {
      ok: false,
      description: `Invalid JSON response from Telegram: ${responseText.substring(0, 200)}`
    }
  }
}

/**
 * 发送请求到 Telegram Bot API
 */
async function callTelegramApi(botToken, method, params = {}, files = {}) {
  const url = `${TELEGRAM_API_BASE}${botToken}/${method}`

  // 如果有文件需要上传，使用 FormData
  if (Object.keys(files).length > 0) {
    const FormData = (await import('form-data')).default
    const form = new FormData()

    // 添加普通参数
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          form.append(key, JSON.stringify(value))
        } else {
          form.append(key, String(value))
        }
      }
    }

    // 添加文件
    for (const [key, filePath] of Object.entries(files)) {
      form.append(key, fs.createReadStream(filePath))
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
      })

      return await parseResponse(response, method)
    } catch (fetchError) {
      logger.error(`Network error calling Telegram API ${method}: ${fetchError.message}`)
      return {
        ok: false,
        description: `Network error: ${fetchError.message}`
      }
    }
  }

  // 没有文件，使用 JSON
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })

    return await parseResponse(response, method)
  } catch (fetchError) {
    logger.error(`Network error calling Telegram API ${method}: ${fetchError.message}`)
    return {
      ok: false,
      description: `Network error: ${fetchError.message}`
    }
  }
}

/**
 * 验证 Bot Token
 */
export async function validateBotToken(botToken) {
  try {
    const result = await callTelegramApi(botToken, 'getMe')
    if (result.ok) {
      return {
        valid: true,
        bot: result.result
      }
    }
    return { valid: false, error: result.description }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

/**
 * 获取机器人信息
 */
export async function getBotInfo(botToken) {
  const result = await callTelegramApi(botToken, 'getMe')
  if (!result.ok) {
    throw new Error(result.description || 'Failed to get bot info')
  }
  return result.result
}

/**
 * 上传贴纸文件到 Telegram
 */
export async function uploadStickerFile(botToken, userId, stickerPath, stickerFormat) {
  const FormData = (await import('form-data')).default
  const form = new FormData()

  const fileName = path.basename(stickerPath)
  const ext = path.extname(stickerPath).toLowerCase()

  // 根据文件扩展名确定 MIME 类型
  let contentType
  if (ext === '.webp') {
    contentType = 'image/webp'
  } else if (ext === '.webm') {
    contentType = 'video/webm'
  } else if (ext === '.tgs') {
    contentType = 'application/gzip'
  } else {
    contentType = 'application/octet-stream'
  }

  // 读取文件内容为 Buffer
  const fileBuffer = fs.readFileSync(stickerPath)

  form.append('user_id', String(userId))
  form.append('sticker', fileBuffer, {
    filename: fileName,
    contentType: contentType,
    knownLength: fileBuffer.length
  })
  form.append('sticker_format', stickerFormat)

  const url = `${TELEGRAM_API_BASE}${botToken}/uploadStickerFile`

  logger.info(
    `Uploading sticker file: ${fileName}, format: ${stickerFormat}, contentType: ${contentType}, size: ${fileBuffer.length} bytes`
  )

  // 使用 form-data 的 submit 方法发送请求
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url)

    form.submit(
      {
        protocol: urlObj.protocol,
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname,
        method: 'POST'
      },
      (err, res) => {
        if (err) {
          logger.error(`Network error uploading sticker file: ${err.message}`)
          return reject(new Error(`Network error: ${err.message}`))
        }

        let responseBody = ''
        res.on('data', chunk => {
          responseBody += chunk.toString()
        })

        res.on('end', () => {
          logger.info(
            `Telegram API uploadStickerFile response (status: ${res.statusCode}): ${responseBody.substring(0, 500)}`
          )

          if (!responseBody || responseBody.trim() === '') {
            return reject(new Error(`Empty response from Telegram (HTTP ${res.statusCode})`))
          }

          try {
            const result = JSON.parse(responseBody)
            if (!result.ok) {
              return reject(new Error(result.description || 'Failed to upload sticker file'))
            }
            resolve(result.result)
          } catch (parseError) {
            logger.error(`Failed to parse response: ${responseBody}`)
            return reject(new Error(`Invalid JSON response: ${responseBody.substring(0, 200)}`))
          }
        })

        res.on('error', error => {
          reject(new Error(`Response error: ${error.message}`))
        })
      }
    )
  })
}

/**
 * 创建新贴纸包
 */
export async function createStickerSet(botToken, userId, name, title, stickers) {
  const result = await callTelegramApi(botToken, 'createNewStickerSet', {
    user_id: userId,
    name: name,
    title: title,
    stickers: stickers
  })

  if (!result.ok) {
    throw new Error(result.description || 'Failed to create sticker set')
  }
  return result.result
}

/**
 * 添加贴纸到现有贴纸包
 */
export async function addStickerToSet(botToken, userId, name, sticker) {
  const result = await callTelegramApi(botToken, 'addStickerToSet', {
    user_id: userId,
    name: name,
    sticker: sticker
  })

  if (!result.ok) {
    throw new Error(result.description || 'Failed to add sticker to set')
  }
  return result.result
}

/**
 * 获取贴纸包信息
 */
export async function getStickerSet(botToken, name) {
  const result = await callTelegramApi(botToken, 'getStickerSet', { name })
  if (!result.ok) {
    if (result.description?.includes('STICKERSET_INVALID')) {
      return null // 贴纸包不存在
    }
    throw new Error(result.description || 'Failed to get sticker set')
  }
  return result.result
}

/**
 * 批量上传贴纸到贴纸包
 * @param {string} botToken - Bot Token
 * @param {number} userId - 用户 ID
 * @param {string} packName - 贴纸包短名称（不含 _by_xxx）
 * @param {string} packTitle - 贴纸包标题
 * @param {Array} stickerFiles - 贴纸文件路径数组
 * @param {string} emoji - 默认表情
 * @param {function} onProgress - 进度回调
 */
export async function batchUploadStickers(
  botToken,
  userId,
  packName,
  packTitle,
  stickerFiles,
  emoji = '😊',
  onProgress
) {
  const results = {
    success: [],
    failed: [],
    packUrl: null,
    totalCount: stickerFiles.length
  }

  try {
    // 获取机器人信息以构建完整贴纸包名称
    const botInfo = await getBotInfo(botToken)
    const fullPackName = `${packName}_by_${botInfo.username}`

    logger.info(`Starting batch upload to pack: ${fullPackName}`)

    // 检查贴纸包是否已存在
    let packExists = false
    try {
      const existingPack = await getStickerSet(botToken, fullPackName)
      packExists = !!existingPack
      if (packExists) {
        logger.info(`Sticker pack already exists with ${existingPack.stickers.length} stickers`)
      }
    } catch {
      packExists = false
    }

    let uploadedCount = 0

    for (let i = 0; i < stickerFiles.length; i++) {
      const filePath = stickerFiles[i]
      const fileName = path.basename(filePath)

      try {
        // 确定贴纸格式
        const ext = path.extname(filePath).toLowerCase()
        const stickerFormat = ext === '.webm' ? 'video' : 'static'

        // 上传贴纸文件
        const uploadedFile = await uploadStickerFile(botToken, userId, filePath, stickerFormat)

        // 构建 InputSticker 对象
        const inputSticker = {
          sticker: uploadedFile.file_id,
          emoji_list: [emoji],
          format: stickerFormat
        }

        if (!packExists && uploadedCount === 0) {
          // 创建新贴纸包
          await createStickerSet(botToken, userId, fullPackName, packTitle, [inputSticker])
          packExists = true
          logger.info(`Created new sticker pack: ${fullPackName}`)
        } else {
          // 添加到现有贴纸包
          await addStickerToSet(botToken, userId, fullPackName, inputSticker)
        }

        uploadedCount++
        results.success.push({ fileName, index: i })

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: stickerFiles.length,
            fileName,
            status: 'success'
          })
        }

        // 添加延迟避免限速
        if (i < stickerFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error) {
        logger.error(`Failed to upload ${fileName}: ${error.message}`)
        results.failed.push({ fileName, index: i, error: error.message })

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: stickerFiles.length,
            fileName,
            status: 'failed',
            error: error.message
          })
        }

        // 如果是贴纸数量超限，停止上传
        if (error.message.includes('too_much') || error.message.includes('TOO_MUCH')) {
          logger.warn('Sticker pack is full, stopping upload')
          break
        }
      }
    }

    results.packUrl = `https://t.me/addstickers/${fullPackName}`
    results.packName = fullPackName

    return results
  } catch (error) {
    logger.error(`Batch upload failed: ${error.message}`)
    throw error
  }
}

export default {
  validateBotToken,
  getBotInfo,
  uploadStickerFile,
  createStickerSet,
  addStickerToSet,
  getStickerSet,
  batchUploadStickers
}
