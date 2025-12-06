# Telegram Sticker Maker

将图片或视频转换为 Telegram 贴纸格式

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite)](https://vitejs.dev/)

---

## 功能

### 静态贴纸

- PNG/WEBP/JPG → PNG + WEBP
- 512×512 以内，保持透明
- 不支持 GIF 动图（请使用视频贴纸功能）

### 视频贴纸

- GIF/MP4/WEBM → WEBM VP9
- 时间截取（≤3 秒），≤256KB
- 30 FPS，无音轨

---

## 快速开始

**环境要求**: Node.js 18+ + FFmpeg

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量（可选）

```bash
# 后端配置
copy .env.example .env

# 前端配置（如需自定义上传限制）
# 创建 .env 文件并添加 VITE_ 前缀的环境变量
echo VITE_MAX_IMAGE_FILES=20 > .env
echo VITE_MAX_VIDEO_FILES=10 >> .env
```

**后端可配置项：**

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `3000` | 服务器端口 |
| `MAX_FILE_SIZE` | `52428800` | 最大文件大小 (50MB) |
| `MAX_IMAGE_FILES` | `20` | 最多上传图片数量 |
| `MAX_VIDEO_FILES` | `10` | 最多上传视频数量 |
| `UPLOAD_DIR` | `uploads` | 上传目录 |
| `OUTPUT_DIR` | `output` | 输出目录 |
| `CLEANUP_INTERVAL` | `3600000` | 清理间隔 (1小时) |
| `FILE_MAX_AGE` | `86400000` | 文件保留时长 (24小时) |
| `CORS_ORIGIN` | `http://localhost:5173` | CORS 允许源 |

**前端可配置项（Vite 环境变量）：**

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `VITE_MAX_IMAGE_FILES` | `20` | 最多上传图片数量 |
| `VITE_MAX_VIDEO_FILES` | `10` | 最多上传视频数量 |
| `VITE_MAX_FILE_SIZE` | `52428800` | 最大文件大小 (50MB) |

### 3. 开发模式

```bash
npm run dev
```

- 前端: <http://localhost:5173>
- 后端: <http://localhost:3000>

### 4. 生产部署

```bash
# 构建前端
npm run build

# 启动服务器
npm start
```

访问：<http://localhost:3000>

### 其他命令

```bash
# 清理临时文件
npm run clean

# 预览生产构建
npm run preview
```

---

## 技术栈

**前端：** Vue 3 • Vite • Vue I18n  
**后端：** Node.js • Express • Sharp • FFmpeg • Archiver • Multer  
**实时通信：** WebSocket (ws) • 实时进度追踪  
**样式：** Telegram 风格 • 暗色主题  
**架构：** 模块化设计 • RESTful API • 错误处理 • 日志系统 • 自动清理

---

## 项目结构

```plaintext
├── server/                    # 后端代码（模块化架构）
│   ├── config/               # 配置管理
│   ├── routes/               # API 路由
│   ├── services/             # 业务逻辑
│   ├── middleware/           # 中间件
│   └── utils/                # 工具函数
├── src/                      # 前端代码
│   ├── components/          # Vue 组件
│   ├── composables/         # 组合式函数
│   ├── locales/             # 国际化翻译
│   │   ├── en.js           # 英文
│   │   └── zh.js           # 中文
│   ├── styles/              # 全局样式
│   ├── utils/               # 工具函数
│   ├── i18n.js              # i18n 配置
│   ├── App.vue              # 主应用
│   └── main.js              # 入口文件
├── uploads/                  # 上传临时目录
├── output/                   # 输出目录
├── server.js                 # 服务器入口
├── package.json              # 项目配置
├── vite.config.js            # Vite 配置
└── ARCHITECTURE.md           # 架构文档
```

---

## API

### `POST /api/convert-image`

转换图片

- **参数**: `image` (file), `taskId` (string, optional)
- **返回**: PNG 和 WEBP 两种格式

### `POST /api/convert-video`

转换视频

- **参数**: `video` (file), `startTime` (number), `endTime` (number), `taskId` (string, optional)
- **返回**: WEBM 格式

### `POST /api/download-batch`

批量打包下载

- **参数**: `files` (array) - 包含 `url` 和 `name` 的文件列表
- **返回**: ZIP 压缩包

### `WebSocket /ws`

实时进度更新

- **消息类型**:
  - `subscribe` - 订阅任务进度
  - `progress` - 进度更新 (0-100%)
  - `complete` - 任务完成
  - `error` - 错误信息

---

## 国际化

应用支持中文和英文双语切换：

- 🌍 自动检测浏览器语言
- 💾 自动保存语言偏好到 LocalStorage
- 🔄 实时切换无需刷新

### 添加新语言

1. 在 `src/locales/` 创建新的语言文件（如 `ja.js`）
2. 在 `src/i18n.js` 中导入并添加到 messages
3. 更新 `App.vue` 中的语言切换器

---

## 相关文档

- [架构文档](./ARCHITECTURE.md) - 详细的技术架构说明
- [API 文档](./ARCHITECTURE.md#api-接口) - 完整的 API 接口文档

---

## 许可证

[MIT License](./LICENSE)

基于 [Telegram Sticker 官方规范](https://core.telegram.org/stickers)
