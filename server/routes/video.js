import express from 'express'
import videoService from '../services/videoService.js'
import { upload, handleUploadError } from '../middleware/upload.js'

const router = express.Router()

/**
 * 转换视频为贴纸格式
 * POST /api/convert-video
 */
router.post('/convert-video', upload.single('video'), handleUploadError, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传视频或GIF文件' })
    }

    const startTime = parseFloat(req.body.startTime) || 0
    const endTime = parseFloat(req.body.endTime) || 3
    const taskId = req.body.taskId || null

    const result = await videoService.convertToSticker(req.file.path, req.file.originalname, startTime, endTime, taskId)

    res.json({
      success: true,
      taskId,
      original: {
        ...result.original,
        size: req.file.size
      },
      result: result.result
    })
  } catch (error) {
    next(error)
  }
})

export default router
