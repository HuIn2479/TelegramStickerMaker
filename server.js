import express from 'express'
import { createServer } from 'http'
import fs from 'fs'
import path from 'path'
import config from './server/config/index.js'
import routes from './server/routes/index.js'
import { requestLogger, errorHandler, notFoundHandler } from './server/middleware/errorHandler.js'
import { startCleanupSchedule } from './server/utils/fileCleanup.js'
import { logger } from './server/utils/logger.js'
import wsManager from './server/utils/websocket.js'

const app = express()
const server = createServer(app)

// 确保必要目录存在
Object.values(config.paths).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    logger.info(`Created directory: ${dir}`)
  }
})

// 中间件
app.use(express.json({ charset: 'utf-8' }))
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }))
app.use(requestLogger)

// CORS 配置（开发环境）
if (config.env === 'development') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', config.cors.origin)
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Content-Type', 'application/json; charset=utf-8')

    if (req.method === 'OPTIONS') {
      return res.sendStatus(200)
    }
    next()
  })
}

// 静态文件服务
if (config.env === 'production') {
  app.use(express.static(config.paths.dist))
}

// API 路由
app.use('/api', routes)

// 生产环境下，所有其他路由返回 index.html
if (config.env === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(config.paths.dist, 'index.html'))
  })
}

// 错误处理
app.use(notFoundHandler)
app.use(errorHandler)

// 初始化 WebSocket
wsManager.initialize(server)

// 启动服务器
server.listen(config.port, () => {
  logger.success(`🚀 Server running on http://localhost:${config.port}`)
  logger.success(`🔌 WebSocket server running on ws://localhost:${config.port}/ws`)
  logger.info(`📁 Temp directory: ${config.paths.temp}`)
  logger.info(`🌍 Environment: ${config.env}`)

  // 启动时清理临时目录中的过期文件
  if (config.temp.cleanupOnStartup) {
    startCleanupSchedule([config.paths.temp], config.temp.maxAge, config.temp.maxAge)
    logger.info(`✅ Temp file cleanup enabled (max age: ${config.temp.maxAge / 1000 / 60} minutes)`)
  }
})

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...')
  wsManager.close()
  server.close(() => {
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...')
  wsManager.close()
  server.close(() => {
    process.exit(0)
  })
})

export default app
