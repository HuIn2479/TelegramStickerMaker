# Telegram Sticker Maker

> [!NOTE]
> 项目只在 Windows 下测试通过，Linux 和 macOS用户请自行测试

将图片或视频转换为 Telegram 贴纸格式

[![Vue 3](https://img.shields.io/badge/Vue-3.5.26-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.3.0-646CFF?logo=vite)](https://vitejs.dev/)

## 功能

| 类型 | 输入格式 | 输出格式 | 限制 |
|------|----------|----------|------|
| 静态贴纸 | PNG/WEBP/JPG | PNG + WEBP | 512×512，批量≤20张 |
| 视频贴纸 | GIF/MP4/WEBM | WEBM VP9 | ≤3秒，≤256KB，30FPS，批量≤10个 |

## 快速开始

**环境要求**: Node.js 20+ 、 FFmpeg

```bash
# 安装依赖
npm install

# 开发模式
npm run dev      # 前端 :5173 / 后端 :3000

# 生产部署
npm run build && npm start   # 访问 :3000
```

## API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/convert-image` | POST | 转换图片 |
| `/api/convert-video` | POST | 转换视频 |
| `/api/download-batch` | POST | 批量打包下载 |
| `/ws` | WebSocket | 实时进度 |

## 技术栈

- **前端框架**: Vue 3.5.26 + Vite 7.3.0
- **UI 组件**: WeUI 2.6.25
- **国际化**: Vue I18n 11.2.8
- **后端服务**: Node.js 20+ + Express 5.2.1
- **图片处理**: Sharp 0.34.5
- **视频处理**: FFmpeg (fluent-ffmpeg 2.1.2)
- **文件上传**: Multer 2.0.2
- **实时通信**: WebSocket (ws 8.19.0)
- **文件存储**: 操作系统临时目录（自动清理）

## 许可证

[MIT](./LICENSE) | 基于 [Telegram Sticker](https://core.telegram.org/stickers) 规范
