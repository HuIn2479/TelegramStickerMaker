import fs from 'fs'
import path from 'path'
import { config } from '../utils/config'
import { ensureDir } from '../utils/fileCleanup'
import { logger } from '../utils/logger'

export default defineEventHandler(async (event) => {
  try {
    const formData = await readMultipartFormData(event)
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, message: '请上传文件' })
    }

    const filePart = formData.find(part => part.name === 'file')
    if (!filePart || !filePart.data) {
      throw createError({ statusCode: 400, message: '请上传文件' })
    }

    let filename = filePart.filename || `converted-${Date.now()}.webm`
    // Sanitize filename
    const rawBaseName = path.basename(filename, path.extname(filename))
    const safeBaseName = rawBaseName.replace(/[^\w.-]/g, '_').slice(0, 40)
    const ext = path.extname(filename) || '.webm'
    const outputFilename = `${safeBaseName}-${Date.now()}${ext}`
    const outputPath = path.join(config.paths.temp, outputFilename)

    ensureDir(config.paths.temp)
    fs.writeFileSync(outputPath, filePart.data)

    logger.info(`Converted file saved: ${outputFilename} (${filePart.data.length} bytes)`)

    return {
      success: true,
      filename: outputFilename,
      size: filePart.data.length
    }
  } catch (error: any) {
    logger.error('Upload converted error:', error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message || '上传失败' })
  }
})
