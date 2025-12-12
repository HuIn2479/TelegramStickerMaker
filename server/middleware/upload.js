import multer from 'multer'
import path from 'path'
import config from '../config/index.js'

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
 * Multer 存储配置
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.paths.uploads)
  },
  filename: (req, file, cb) => {
    // 修复原始文件名编码
    file.originalname = fixFilenameEncoding(file.originalname)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${uniqueSuffix}${ext}`)
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
 * Multer 上传中间件
 */
export const upload = multer({
  storage,
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
