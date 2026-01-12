import multer from 'multer'
import path from 'path'
import fs from 'fs'
import config from '../config/index.js'

/**
 * 确保临时目录存在
 */
function ensureTempDir() {
  if (!fs.existsSync(config.paths.temp)) {
    fs.mkdirSync(config.paths.temp, { recursive: true })
  }
}

/**
 * 修复文件名编码（ISO-8859-1 转 UTF-8）
 */
function fixFilenameEncoding(filename) {
  try {
    // 如果文件名已经是正确的 UTF-8，直接返回
    if (/^[\x00-\x7F]*$/.test(filename)) return filename
    // 将 ISO-8859-1 误解码的字符串转回 Buffer，再用 UTF-8 正确解码
    return Buffer.from(filename, 'latin1').toString('utf8')
  } catch (error) {
    return filename
  }
}

/**
 * Multer 内存存储配置 - 小文件直接在内存中处理
 */
const memoryStorage = multer.memoryStorage()

/**
 * Multer 磁盘存储配置 - 用于大文件
 */
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureTempDir()
    cb(null, config.paths.temp)
  },
  filename: (req, file, cb) => {
    // 修复原始文件名编码
    file.originalname = fixFilenameEncoding(file.originalname)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `upload-${uniqueSuffix}${ext}`)
  }
})

/**
 * 文件过滤器
 */
const fileFilter = (req, file, cb) => {
  if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的文件格式'), false)
  }
}

/**
 * Multer 上传中间件（使用磁盘存储）
 */
export const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
})

/**
 * Multer 内存上传中间件（用于小文件快速处理）
 */
export const uploadMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize
  }
})

/**
 * 错误处理中间件
 */
export function handleUploadError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: `文件大小超过限制 (最大 ${config.upload.maxFileSize / 1024 / 1024}MB)`
      })
    }
    return res.status(400).json({ error: err.message })
  }

  if (err) {
    return res.status(400).json({ error: err.message })
  }

  next()
}

export default { upload, handleUploadError }
