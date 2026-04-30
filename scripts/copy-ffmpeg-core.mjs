import { mkdir, readdir, copyFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRoot = path.resolve(__dirname, '..')
const srcDir = path.join(projectRoot, 'node_modules', '@ffmpeg', 'core', 'dist', 'esm')
const destDir = path.join(projectRoot, 'public', 'ffmpeg')

const run = async () => {
  await mkdir(destDir, { recursive: true })

  const entries = await readdir(srcDir, { withFileTypes: true })
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.startsWith('ffmpeg-core.'))
    .map((entry) => entry.name)

  if (files.length === 0) {
    throw new Error('No ffmpeg-core assets found in @ffmpeg/core')
  }

  await Promise.all(
    files.map((name) => copyFile(path.join(srcDir, name), path.join(destDir, name)))
  )
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
