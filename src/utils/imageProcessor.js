/**
 * 前端图片处理工具（无需服务器）
 * 使用 Canvas API 进行图片转换
 */

/**
 * 将图片转换为 PNG/WEBP（客户端处理）
 */
export async function convertImageLocally(file) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      try {
        // 计算新尺寸（一边最大512px）
        let width = img.width
        let height = img.height
        const maxSize = 512

        if (width > maxSize || height > maxSize) {
          if (width >= height) {
            height = Math.round((height / width) * maxSize)
            width = maxSize
          } else {
            width = Math.round((width / height) * maxSize)
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height)

        // 转换为 PNG Blob
        canvas.toBlob(pngBlob => {
          // 转换为 WEBP Blob
          canvas.toBlob(webpBlob => {
            if (!pngBlob || !webpBlob) {
              reject(new Error('转换失败'))
              return
            }

            // 创建本地 URL
            const pngUrl = URL.createObjectURL(pngBlob)
            const webpUrl = URL.createObjectURL(webpBlob)

            resolve({
              success: true,
              original: {
                width: img.width,
                height: img.height,
                size: file.size
              },
              result: {
                png: {
                  url: pngUrl,
                  blob: pngBlob,
                  size: pngBlob.size,
                  width,
                  height
                },
                webp: {
                  url: webpUrl,
                  blob: webpBlob,
                  size: webpBlob.size,
                  width,
                  height
                }
              }
            })
          }, 'image/webp', 0.9)
        }, 'image/png')

        // 清理
        URL.revokeObjectURL(img.src)
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('图片加载失败'))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * 下载 Blob 为文件
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * 检测浏览器是否支持客户端转换
 */
export function isLocalConversionSupported() {
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    return !!(ctx && canvas.toBlob)
  } catch {
    return false
  }
}

/**
 * 将视频转换为 WEBM（客户端处理 - 仅限 GIF）
 * 注意：完整的视频转换需要 FFmpeg，这里只处理简单的视频压缩
 */
export async function convertVideoLocally(file, startTime = 0, endTime = 3) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    video.onloadedmetadata = async () => {
      try {
        const duration = Math.min(endTime - startTime, 3)
        const width = video.videoWidth
        const height = video.videoHeight

        // 计算缩放尺寸
        let newWidth, newHeight
        const maxSize = 512
        if (width >= height) {
          newWidth = maxSize
          newHeight = Math.round((height / width) * maxSize)
        } else {
          newHeight = maxSize
          newWidth = Math.round((width / height) * maxSize)
        }

        canvas.width = newWidth
        canvas.height = newHeight

        // 对于 GIF，捕获第一帧作为静态图
        video.currentTime = startTime
        
        await new Promise(resolve => {
          video.onseeked = resolve
        })

        ctx.drawImage(video, 0, 0, newWidth, newHeight)

        canvas.toBlob(blob => {
          if (!blob) {
            reject(new Error('视频转换失败'))
            return
          }

          const url = URL.createObjectURL(blob)
          
          resolve({
            success: true,
            original: {
              width,
              height,
              duration: video.duration,
              size: file.size
            },
            result: {
              url,
              blob,
              size: blob.size,
              width: newWidth,
              height: newHeight,
              duration,
              sizeValid: blob.size <= 256 * 1024
            }
          })

          URL.revokeObjectURL(video.src)
        }, 'image/webp', 0.9)
      } catch (error) {
        reject(error)
      }
    }

    video.onerror = () => {
      reject(new Error('视频加载失败'))
      URL.revokeObjectURL(video.src)
    }

    video.src = URL.createObjectURL(file)
  })
}
