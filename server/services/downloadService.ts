import archiver from 'archiver'
import fs from 'fs'
import path from 'path'
import { config } from '../utils/config'
import { logger } from '../utils/logger'
import { ensureDir } from '../utils/fileCleanup'

export async function batchDownload(files: { url: string; name: string }[], event: any) {
  ensureDir(config.paths.temp)

  const archive = archiver('zip', { zlib: { level: 9 } })

  event.node.res.setHeader('Content-Type', 'application/zip')
  event.node.res.setHeader('Content-Disposition', `attachment; filename=stickers-${Date.now()}.zip`)

  archive.on('error', err => {
    logger.error('Archive error:', err)
    throw err
  })

  archive.pipe(event.node.res)

  for (const file of files) {
    let filename = ''
    try {
      const urlObj = new URL(file.url, 'http://localhost')
      filename = path.basename(urlObj.pathname)
    } catch {
      filename = path.basename(file.url || '')
    }

    try {
      filename = decodeURIComponent(filename)
    } catch {
      // ignore invalid uri
    }

    if (!filename) continue

    const filePath = path.join(config.paths.temp, filename)
    if (!fs.existsSync(filePath)) {
      logger.warn('File missing:', filePath)
      continue
    }

    archive.file(filePath, { name: file.name })
  }

  await archive.finalize()
}
