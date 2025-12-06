import { logger } from '../utils/logger.js'

/**
 * 请求日志中间件
 */
export function requestLogger(req, res, next) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logLevel = res.statusCode >= 400 ? 'error' : 'info'
    
    logger[logLevel](
      `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`
    )
  })
  
  next()
}

/**
 * 错误处理中间件
 */
export function errorHandler(err, req, res, next) {
  logger.error(`Error handling ${req.method} ${req.path}:`, err)
  
  const statusCode = err.statusCode || 500
  const message = err.message || '服务器内部错误'
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

/**
 * 404 处理中间件
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: '请求的资源不存在'
  })
}

export default {
  requestLogger,
  errorHandler,
  notFoundHandler
}
