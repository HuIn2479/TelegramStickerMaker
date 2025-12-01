# Telegram Sticker Maker

将图片或视频转换为 Telegram 贴纸格式

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Docker-✓-2496ED?logo=docker)](https://www.docker.com/)

---

---

## 功能

### 静态贴纸

- PNG/WEBP/JPG/GIF → PNG + WEBP
- 512×512 以内,保持透明

### 视频贴纸

- GIF/MP4/WEBM → WEBM VP9
- 时间截取（≤3 秒),≤256KB
- 30 FPS,无音轨

### 其他

- 批量处理、实时预览、批量下载

---

## 快速开始

### Docker(推荐)

```bash
docker-compose up -d
```

访问: <http://localhost:3000>

### 本地开发

需要: Node.js 18+ + FFmpeg

```bash
npm install
npm run dev
```

访问: <http://localhost:5173>

---

## 技术栈

Vue 3 • Vite • Node.js • Express • Sharp • FFmpeg

---

## 项目结构

```plaintext
├── src/              # 前端 Vue 代码
├── server.js         # 后端 API
├── Dockerfile
└── docker-compose.yml
```

---

## API

### `POST /api/convert-image`

转换图片

- **参数**: `image` (file)
- **返回**: PNG 和 WEBP 两种格式

### `POST /api/convert-video`

转换视频

- **参数**: `video` (file), `startTime` (number), `endTime` (number)
- **返回**: WEBM 格式

---

## 部署

### Docker

```bash
docker-compose up -d
```

详见 [DOCKER.md](./DOCKER.md)

### 生产环境

```bash
npm run build
npm start
```

---

## License

MIT • 基于 [Telegram Sticker 规范](https://core.telegram.org/stickers)
