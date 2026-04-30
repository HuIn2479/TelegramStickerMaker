import { batchDownload } from '../../services/downloadService'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const files = body?.files

  if (!files || !Array.isArray(files) || files.length === 0) {
    throw createError({ statusCode: 400, statusMessage: '请提供文件列表' })
  }

  await batchDownload(files, event)
})
