import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '../..')

export const config = {
  // 环境配置
  env: process.env.NODE_ENV || 'development',
  port: 3000,

  // 路径配置
  paths: {
    root: rootDir,
    uploads: path.join(rootDir, 'uploads'),
    output: path.join(rootDir, 'output'),
    dist: path.join(rootDir, 'dist')
  },

  // 文件上传配置
  upload: {
    maxFileSize: 52428800, // 50MB
    maxImageFiles: 20, // 最多上传图片数量
    maxVideoFiles: 10, // 最多上传视频数量
    allowedImageTypes: /jpeg|jpg|png|webp|gif/,
    allowedVideoTypes: /gif|mp4|webm|quicktime|x-msvideo/,
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo'
    ]
  },

  // 文件清理配置
  cleanup: {
    interval: 3600000, // 1 hour
    maxAge: 86400000 // 24 hours
  },

  // 贴纸格式要求
  sticker: {
    maxSize: 512,
    maxVideoDuration: 3,
    videoFps: 30,
    maxVideoFileSize: 256 * 1024, // 256KB
    imageQuality: {
      webp: 90,
      png: 9 // compression level
    }
  },

  // CORS 配置
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
}

export default config
