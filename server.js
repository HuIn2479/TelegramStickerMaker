import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000

// 确保上传和输出目录存在
const uploadDir = path.join(__dirname, 'uploads')
const outputDir = path.join(__dirname, 'output')
;[uploadDir, outputDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
})

// 配置 multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|webp|gif|mp4|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname || mimetype) {
            return cb(null, true);
        }
        cb(new Error('不支持的文件格式'));
    }
});

// 静态文件 - 仅在生产环境下提供静态文件
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')))
}
app.use('/output', express.static(outputDir))

// 处理静态图片
app.post('/api/convert-image', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '请上传图片文件' });
    }

    try {
        const inputPath = req.file.path;
        const outputFilename = `sticker-${Date.now()}`;
        const pngPath = path.join(outputDir, `${outputFilename}.png`);
        const webpPath = path.join(outputDir, `${outputFilename}.webp`);

        // 获取原始图片信息
        const metadata = await sharp(inputPath).metadata();
        const originalWidth = metadata.width;
        const originalHeight = metadata.height;

        // 计算新尺寸 (一边512px，保持比例)
        let newWidth, newHeight;
        if (originalWidth >= originalHeight) {
            newWidth = 512;
            newHeight = Math.round((originalHeight / originalWidth) * 512);
        } else {
            newHeight = 512;
            newWidth = Math.round((originalWidth / originalHeight) * 512);
        }

        // 转换为 PNG
        await sharp(inputPath)
            .resize(newWidth, newHeight, { fit: 'fill' })
            .png()
            .toFile(pngPath);

        // 转换为 WEBP
        await sharp(inputPath)
            .resize(newWidth, newHeight, { fit: 'fill' })
            .webp({ quality: 90 })
            .toFile(webpPath);

        // 获取输出文件大小
        const pngStats = fs.statSync(pngPath);
        const webpStats = fs.statSync(webpPath);

        // 延迟删除上传的原始文件（避免 Windows 文件锁定问题）
        setTimeout(() => {
            try {
                fs.unlinkSync(inputPath);
            } catch (err) {
                console.error('延迟删除文件失败:', err.message);
            }
        }, 1000);

        res.json({
            success: true,
            original: {
                width: originalWidth,
                height: originalHeight,
                size: req.file.size
            },
            result: {
                width: newWidth,
                height: newHeight,
                png: {
                    url: `/output/${outputFilename}.png`,
                    size: pngStats.size
                },
                webp: {
                    url: `/output/${outputFilename}.webp`,
                    size: webpStats.size
                }
            }
        });
    } catch (error) {
        console.error('图片处理错误:', error);
        res.status(500).json({ error: '图片处理失败: ' + error.message });
    }
});

// 处理视频/GIF
app.post('/api/convert-video', upload.single('video'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '请上传视频或GIF文件' });
    }

    const inputPath = req.file.path;
    const outputFilename = `sticker-${Date.now()}.webm`;
    const outputPath = path.join(outputDir, outputFilename);

    // 获取截取参数
    const startTime = parseFloat(req.body.startTime) || 0;
    const endTime = parseFloat(req.body.endTime) || 3;
    const duration = Math.min(endTime - startTime, 3); // 最多3秒

    try {
        // 获取输入视频信息
        const inputInfo = await getVideoInfo(inputPath);
        
        // 计算缩放尺寸
        let scale;
        if (inputInfo.width >= inputInfo.height) {
            scale = `512:-2`;
        } else {
            scale = `-2:512`;
        }

        // 转换视频
        await convertToWebm(inputPath, outputPath, scale, startTime, duration);

        // 检查输出文件大小
        let outputStats = fs.statSync(outputPath);
        
        // 如果超过256KB，尝试更高压缩
        if (outputStats.size > 256 * 1024) {
            await convertToWebm(inputPath, outputPath, scale, startTime, duration, true);
            outputStats = fs.statSync(outputPath);
        }

        // 获取输出视频信息
        const outputInfo = await getVideoInfo(outputPath);

        // 延迟删除上传的原始文件（避免 Windows 文件锁定问题）
        setTimeout(() => {
            try {
                fs.unlinkSync(inputPath);
            } catch (err) {
                console.error('延迟删除视频文件失败:', err.message);
            }
        }, 1000);

        res.json({
            success: true,
            original: {
                width: inputInfo.width,
                height: inputInfo.height,
                duration: inputInfo.duration,
                size: req.file.size
            },
            result: {
                width: outputInfo.width,
                height: outputInfo.height,
                duration: outputInfo.duration,
                size: outputStats.size,
                url: `/output/${outputFilename}`,
                sizeValid: outputStats.size <= 256 * 1024
            }
        });
    } catch (error) {
        console.error('视频处理错误:', error);
        // 延迟清理文件
        setTimeout(() => {
            try {
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            } catch (err) {
                console.error('延迟清理视频文件失败:', err.message);
            }
        }, 1000);
        res.status(500).json({ error: '视频处理失败: ' + error.message });
    }
});

// 获取视频信息
function getVideoInfo(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) {
                reject(err);
                return;
            }
            const videoStream = metadata.streams.find(s => s.codec_type === 'video');
            resolve({
                width: videoStream?.width || 0,
                height: videoStream?.height || 0,
                duration: metadata.format?.duration || 0
            });
        });
    });
}

// 转换为 WEBM
function convertToWebm(inputPath, outputPath, scale, startTime = 0, duration = 3, highCompression = false) {
    return new Promise((resolve, reject) => {
        let command = ffmpeg(inputPath)
            .setStartTime(startTime)
            .duration(duration)
            .videoCodec('libvpx-vp9')
            .outputOptions([
                `-vf scale=${scale},setsar=1`,
                '-r 30',           // 30fps
                '-an',             // 无音频
                '-pix_fmt yuva420p', // 支持透明
                '-auto-alt-ref 0',
                highCompression ? '-b:v 150k' : '-b:v 400k',
                highCompression ? '-crf 45' : '-crf 30',
            ])
            .output(outputPath)
            .on('end', resolve)
            .on('error', reject);
        
        command.run();
    });
}

// 清理旧文件 (每小时清理一次超过24小时的文件，与前端历史记录保持一致)
setInterval(() => {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24小时

    [uploadDir, outputDir].forEach(dir => {
        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);
            if (now - stats.mtimeMs > maxAge) {
                fs.unlinkSync(filePath);
                console.log(`已清理过期文件: ${file}`);
            }
        });
    });
}, 60 * 60 * 1000);

// 生产环境下，所有未匹配的路由返回 index.html (SPA 支持)
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'))
    })
}

app.listen(PORT, () => {
    console.log(`🎨 Telegram Sticker Maker API 运行在 http://localhost:${PORT}`)
    console.log(`📁 上传目录: ${uploadDir}`)
    console.log(`📁 输出目录: ${outputDir}`)
    if (process.env.NODE_ENV !== 'production') {
        console.log(`💡 开发服务器: 请在另一个终端运行 "npm run dev:client"`)
    }
})
