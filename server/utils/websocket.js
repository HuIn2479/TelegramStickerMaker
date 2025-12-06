import { WebSocketServer } from 'ws'
import { logger } from './logger.js'

/**
 * WebSocket 管理器
 * 用于处理实时进度更新
 */
class WebSocketManager {
  constructor() {
    this.wss = null
    this.clients = new Map() // taskId -> Set<WebSocket>
    this.heartbeatInterval = null
  }

  /**
   * 初始化 WebSocket 服务器
   */
  initialize(server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      // 添加配置以提高连接稳定性
      clientTracking: true,
      perMessageDeflate: false,
      maxPayload: 10 * 1024 * 1024
    })

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId()
      ws.isAlive = true
      ws.clientId = clientId
      logger.info(`WebSocket client connected: ${clientId}`)

      // Pong 响应处理
      ws.on('pong', () => {
        ws.isAlive = true
      })

      // 处理消息
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString('utf8'))
          this.handleMessage(ws, data)
        } catch (error) {
          logger.error('Failed to parse WebSocket message:', error)
        }
      })

      // 处理断开连接
      ws.on('close', () => {
        logger.info(`WebSocket client disconnected: ${clientId}`)
        this.removeClient(ws)
      })

      // 处理错误
      ws.on('error', (error) => {
        logger.error(`WebSocket error for ${clientId}:`, error)
      })

      // 发送连接成功消息
      this.send(ws, {
        type: 'connected',
        clientId,
        timestamp: Date.now()
      })
    })

    // 心跳检测 - 每30秒ping一次
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          logger.warn(`Terminating inactive client: ${ws.clientId}`)
          return ws.terminate()
        }

        ws.isAlive = false
        ws.ping()
      })
    }, 30000)

    logger.success('WebSocket server initialized on path: /ws with heartbeat')
  }

  /**
   * 处理客户端消息
   */
  handleMessage(ws, data) {
    const { type, taskId } = data

    switch (type) {
      case 'subscribe':
        if (taskId) {
          this.subscribe(ws, taskId)
          logger.debug(`Client subscribed to task: ${taskId}`)
        }
        break

      case 'unsubscribe':
        if (taskId) {
          this.unsubscribe(ws, taskId)
          logger.debug(`Client unsubscribed from task: ${taskId}`)
        }
        break

      case 'ping':
        this.send(ws, { type: 'pong', timestamp: Date.now() })
        break

      default:
        logger.warn(`Unknown WebSocket message type: ${type}`)
    }
  }

  /**
   * 订阅任务更新
   */
  subscribe(ws, taskId) {
    if (!this.clients.has(taskId)) {
      this.clients.set(taskId, new Set())
    }
    this.clients.get(taskId).add(ws)
  }

  /**
   * 取消订阅任务更新
   */
  unsubscribe(ws, taskId) {
    if (this.clients.has(taskId)) {
      this.clients.get(taskId).delete(ws)
      if (this.clients.get(taskId).size === 0) {
        this.clients.delete(taskId)
      }
    }
  }

  /**
   * 移除客户端的所有订阅
   */
  removeClient(ws) {
    this.clients.forEach((clients, taskId) => {
      clients.delete(ws)
      if (clients.size === 0) {
        this.clients.delete(taskId)
      }
    })
  }

  /**
   * 发送消息给特定客户端
   */
  send(ws, data) {
    if (ws.readyState === 1) { // OPEN
      // 直接发送字符串，ws 库会自动使用 UTF-8 编码
      ws.send(JSON.stringify(data))
    }
  }

  /**
   * 广播进度更新到订阅的客户端
   */
  broadcastProgress(taskId, progress) {
    const clients = this.clients.get(taskId)
    if (!clients) return

    const message = {
      type: 'progress',
      taskId,
      progress,
      timestamp: Date.now()
    }

    clients.forEach(ws => {
      this.send(ws, message)
    })
  }

  /**
   * 发送任务完成通知
   */
  notifyComplete(taskId, result) {
    const clients = this.clients.get(taskId)
    if (!clients) return

    const message = {
      type: 'complete',
      taskId,
      result,
      timestamp: Date.now()
    }

    clients.forEach(ws => {
      this.send(ws, message)
    })

    // 清理订阅
    this.clients.delete(taskId)
  }

  /**
   * 发送任务错误通知
   */
  notifyError(taskId, error) {
    const clients = this.clients.get(taskId)
    if (!clients) return

    const message = {
      type: 'error',
      taskId,
      error: error.message || error,
      timestamp: Date.now()
    }

    clients.forEach(ws => {
      this.send(ws, message)
    })

    // 清理订阅
    this.clients.delete(taskId)
  }

  /**
   * 生成客户端 ID
   */
  generateClientId() {
    return `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 关闭 WebSocket 服务器
   */
  close() {
    // 清理心跳定时器
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.wss) {
      this.wss.close(() => {
        logger.info('WebSocket server closed')
      })
    }
  }
}

// 导出单例
export default new WebSocketManager()
