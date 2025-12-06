import express from 'express'
import imageService from '../services/imageService.js'
import { upload, handleUploadError } from '../middleware/upload.js'

const router = express.Router()

/**
 * 转换图片为贴纸格式
 * POST /api/convert-image
 */
router.post('/convert-image', upload.single('image'), handleUploadError, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请上传图片文件' })
    }

    const taskId = req.body.taskId || null
    const result = await imageService.convertToSticker(req.file.path, req.file.originalname, taskId)
    
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
