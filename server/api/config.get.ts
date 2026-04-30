import { config } from '../utils/config'

export default defineEventHandler(() => {
  return {
    upload: {
      maxFileSize: config.upload.maxFileSize,
      maxImageFiles: config.upload.maxImageFiles,
      maxVideoFiles: config.upload.maxVideoFiles
    },
    sticker: {
      maxSize: config.sticker.maxSize,
      maxVideoDuration: config.sticker.maxVideoDuration
    }
  }
})
