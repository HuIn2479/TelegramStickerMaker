import path from 'path'
import os from 'os'

const rootDir = process.cwd()

export const config = {
  env: process.env.NODE_ENV || 'development',
  paths: {
    root: rootDir,
    temp: path.join(os.tmpdir(), 'telegram-sticker-maker')
  },
  upload: {
    maxFileSize: 52428800,
    maxImageFiles: 200,
    maxVideoFiles: 100,
    allowedMimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm'
    ]
  },
  sticker: {
    maxSize: 512,
    maxVideoDuration: 3,
    videoFps: 30,
    maxVideoFileSize: 256 * 1024,
    imageQuality: {
      webp: 90,
      png: 9
    }
  }
}
