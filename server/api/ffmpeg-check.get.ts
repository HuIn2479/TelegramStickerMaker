import { videoService } from '../services/videoService'

export default defineEventHandler(async () => {
  const result = await videoService.checkFfmpeg()
  return result
})
