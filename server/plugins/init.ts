import { ensureDir } from '../utils/fileCleanup'
import { config } from '../utils/config'

export default defineNitroPlugin(() => {
  ensureDir(config.paths.temp)
})
