import { ref, onUnmounted } from 'vue'

/**
 * WebSocket 连接管理
 */
export function useWebSocket() {
  const ws = ref(null)
  const connected = ref(false)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 3000
  const subscribers = new Map()

  /**
   * 连接 WebSocket
   */
  const connect = () => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = import.meta.env.DEV ? 'localhost:3000' : window.location.host
    const url = `${protocol}//${host}/ws`

    try {
      ws.value = new WebSocket(url)

      ws.value.onopen = () => {
        console.log('WebSocket connected')
        connected.value = true
        reconnectAttempts.value = 0
      }

      ws.value.onmessage = async event => {
        try {
          let text = event.data
          // 如果收到的是 Blob，需要先转换为文本
          if (event.data instanceof Blob) {
            text = await event.data.text()
          }
          const data = JSON.parse(text)
          handleMessage(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
          console.error('Message data:', event.data)
        }
      }

      ws.value.onclose = () => {
        console.log('WebSocket disconnected')
        connected.value = false
        attemptReconnect()
      }

      ws.value.onerror = error => {
        console.error('WebSocket error:', error)
      }
    } catch (error) {
      console.error('Failed to create WebSocket:', error)
      attemptReconnect()
    }
  }

  /**
   * 处理 WebSocket 消息
   */
  const handleMessage = data => {
    const { type, taskId } = data

    switch (type) {
      case 'connected':
        console.log('WebSocket connection established:', data.clientId)
        break

      case 'progress':
      case 'complete':
      case 'error':
        // 通知订阅者
        if (taskId && subscribers.has(taskId)) {
          subscribers.get(taskId).forEach(callback => {
            try {
              callback(data)
            } catch (error) {
              console.error('Error in WebSocket callback:', error)
              console.error('Message data:', data)
            }
          })
        }
        break

      case 'pong':
        // 心跳响应
        break

      case 'telegram_upload_progress':
      case 'telegram_upload_complete':
      case 'telegram_upload_error':
        // 通知 telegram 订阅者
        if (subscribers.has('telegram')) {
          subscribers.get('telegram').forEach(callback => {
            try {
              callback(data)
            } catch (error) {
              console.error('Error in Telegram WebSocket callback:', error)
            }
          })
        }
        break

      default:
        console.warn('Unknown WebSocket message type:', type)
    }
  }

  /**
   * 尝试重新连接
   */
  const attemptReconnect = () => {
    if (reconnectAttempts.value < maxReconnectAttempts) {
      reconnectAttempts.value++
      console.log(`Attempting to reconnect (${reconnectAttempts.value}/${maxReconnectAttempts})...`)
      setTimeout(connect, reconnectDelay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  /**
   * 订阅任务更新
   */
  const subscribe = (taskId, callback) => {
    if (!subscribers.has(taskId)) {
      subscribers.set(taskId, new Set())
    }
    subscribers.get(taskId).add(callback)

    // 发送订阅消息
    send({
      type: 'subscribe',
      taskId
    })

    // 返回取消订阅函数
    return () => unsubscribe(taskId, callback)
  }

  /**
   * 取消订阅任务更新
   */
  const unsubscribe = (taskId, callback) => {
    if (subscribers.has(taskId)) {
      subscribers.get(taskId).delete(callback)

      if (subscribers.get(taskId).size === 0) {
        subscribers.delete(taskId)

        // 发送取消订阅消息
        send({
          type: 'unsubscribe',
          taskId
        })
      }
    }
  }

  /**
   * 发送消息
   */
  const send = data => {
    if (ws.value && ws.value.readyState === WebSocket.OPEN) {
      ws.value.send(JSON.stringify(data))
    }
  }

  /**
   * 关闭连接
   */
  const disconnect = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    connected.value = false
    subscribers.clear()
  }

  /**
   * 发送心跳
   */
  const ping = () => {
    send({ type: 'ping' })
  }

  // 组件卸载时断开连接
  onUnmounted(() => {
    disconnect()
  })

  return {
    ws,
    connected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    ping
  }
}

export default useWebSocket
