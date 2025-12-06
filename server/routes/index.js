import express from 'express'
import imageRoutes from './image.js'
import videoRoutes from './video.js'
import downloadRoutes from './download.js'
import config from '../config/index.js'

const router = express.Router()

// 健康检查
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 获取配置信息
router.get('/config', (req, res) => {
  res.json({
    upload: {
      maxFileSize: config.upload.maxFileSize,
      maxImageFiles: config.upload.maxImageFiles,
      maxVideoFiles: config.upload.maxVideoFiles
    },
    sticker: {
      maxSize: config.sticker.maxSize,
      maxVideoDuration: config.sticker.maxVideoDuration
    }
  })
})

// 挂载子路由
router.use('/', imageRoutes)
router.use('/', videoRoutes)
router.use('/', downloadRoutes)

export default router
