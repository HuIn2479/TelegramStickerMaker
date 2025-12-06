import express from 'express'
import downloadService from '../services/downloadService.js'

const router = express.Router()

/**
 * 批量打包下载
 * POST /api/download-batch
 */
router.post('/download-batch', async (req, res, next) => {
  try {
    const { files } = req.body

    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: '请提供文件列表' })
    }

    await downloadService.batchDownload(files, res)
  } catch (error) {
    next(error)
  }
})

export default router
