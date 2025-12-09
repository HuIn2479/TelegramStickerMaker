# Telegram Sticker Maker

将图片或视频转换为 Telegram 贴纸格式

[![Vue 3](https://img.shields.io/badge/Vue-3.4-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?logo=vite)](https://vitejs.dev/)

## 功能

| 类型 | 输入格式 | 输出格式 | 限制 |
|------|----------|----------|------|
| 静态贴纸 | PNG/WEBP/JPG | PNG + WEBP | 512×512，批量≤20张 |
| 视频贴纸 | GIF/MP4/WEBM | WEBM VP9 | ≤3秒，≤256KB，30FPS，批量≤10个 |

## 快速开始

**环境要求**: Node.js 18+ 、 FFmpeg

```bash
# 安装依赖
npm install

# 开发模式
npm run dev      # 前端 :5173 / 后端 :3000

# 生产部署
npm run build && npm start   # 访问 :3000
```

## 配置

复制 `.env.example` 为 `.env`，主要配置项：

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务端口 |
| `MAX_FILE_SIZE` | `52428800` | 文件大小限制 (50MB) |
| `MAX_IMAGE_FILES` | `20` | 图片数量限制 |
| `MAX_VIDEO_FILES` | `10` | 视频数量限制 |

前端配置使用 `VITE_` 前缀，如 `VITE_MAX_IMAGE_FILES`。

## API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/convert-image` | POST | 转换图片 |
| `/api/convert-video` | POST | 转换视频 |
| `/api/download-batch` | POST | 批量打包下载 |
| `/ws` | WebSocket | 实时进度 |

## 技术栈

- **前端**: Vue 3 + Vite + Vue I18n
- **后端**: Express + Sharp + FFmpeg
- **通信**: WebSocket 实时进度

## 许可证

[MIT](./LICENSE) | 基于 [Telegram Sticker 规范](https://core.telegram.org/stickers)