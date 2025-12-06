# WebSocket 实时进度功能

## 功能概述

项目现已集成 WebSocket 实时进度追踪功能，支持在转换过程中显示实时进度信息。

## 架构说明

### 后端 WebSocket 服务

**位置**: `server/utils/websocket.js`

**功能**:
- WebSocket 服务器初始化和客户端管理
- 发布/订阅模式的消息分发
- 自动清理断开的客户端连接
- 支持多客户端订阅同一任务

**消息类型**:
```javascript
// 连接成功
{ type: 'connected', clientId: 'client-xxx' }

// 订阅任务
{ type: 'subscribe', taskId: 'task-xxx' }

// 进度更新
{ type: 'progress', taskId: 'task-xxx', progress: { percentage: 50, message: '处理中...' } }

// 任务完成
{ type: 'complete', taskId: 'task-xxx', result: { ... } }

// 错误
{ type: 'error', taskId: 'task-xxx', error: '错误信息' }

// 心跳
{ type: 'ping' }
{ type: 'pong' }
```

### 进度追踪器

**位置**: `server/utils/progressTracker.js`

**功能**:
- 统一的进度更新接口
- 自动广播进度到所有订阅客户端
- 支持增量更新和直接设置进度

**使用示例**:
```javascript
const tracker = new ProgressTracker(taskId, wsManager)

// 更新进度
tracker.update(20, '读取文件信息...')

// 增量更新（+1%）
tracker.increment('处理中...')

// 完成
tracker.complete({ result: data })

// 错误
tracker.error('转换失败')
```

### 服务集成

#### 图片转换 (`server/services/imageService.js`)

**进度步骤** (5步，每步20%):
1. 读取图片信息 (0%)
2. 计算目标尺寸 (20%)
3. 转换为 PNG (40%)
4. 转换为 WEBP (60%)
5. 保存文件 (80%)
6. 完成 (100%)

#### 视频转换 (`server/services/videoService.js`)

**进度步骤** (100步):
- FFmpeg 实时进度回调
- 基于视频时长和处理帧数计算百分比
- 支持压缩重试（增加额外进度）

**FFmpeg 进度示例**:
```javascript
ffmpeg(inputPath)
  .on('progress', (progress) => {
    // FFmpeg 提供: timemark, currentKbps, targetSize, etc.
    const percentage = calculatePercentage(progress)
    tracker.update(percentage, `处理中: ${progress.timemark}`)
  })
```

## 前端集成

### WebSocket Composable

**位置**: `src/composables/useWebSocket.js`

**功能**:
- 自动连接和重连（最多5次，延迟3秒）
- 任务订阅/取消订阅
- 响应式连接状态
- 消息路由和回调处理

**使用方法**:
```javascript
import { useWebSocket } from '@/composables/useWebSocket'

const { connect, subscribe, unsubscribe, connected } = useWebSocket()

// 连接 WebSocket
connect()

// 订阅任务进度
const unsubscribe = subscribe(taskId, (data) => {
  if (data.type === 'progress') {
    console.log('进度:', data.progress)
  } else if (data.type === 'complete') {
    console.log('完成:', data.result)
    unsubscribe() // 取消订阅
  } else if (data.type === 'error') {
    console.error('错误:', data.error)
    unsubscribe()
  }
})
```

### 组件集成

#### App.vue
- 初始化 WebSocket 连接
- 使用 `provide` 向子组件提供 WebSocket 实例
- 组件销毁时断开连接

#### StaticStickerPanel.vue / VideoStickerPanel.vue
- 使用 `inject` 获取 WebSocket 实例
- 在 `convertSingle` 函数中订阅任务进度
- 实时更新任务的 `progress` 属性
- 转换完成或失败时取消订阅

#### BatchItem.vue
- 显示实时进度条
- 展示进度百分比和状态消息
- 带动画的进度条效果

### 进度显示

**HTML 结构**:
```vue
<template v-if="task.status === 'converting'">
  <div class="batch-item-progress">
    <div class="progress-header">
      <span class="loading-spinner"></span>
      <span class="progress-message">{{ task.progress?.message }}</span>
      <span class="progress-percentage">{{ task.progress?.percentage }}%</span>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: task.progress?.percentage + '%' }"></div>
    </div>
  </div>
</template>
```

**样式**:
- 渐变色进度条
- 流畅的过渡动画
- 响应式布局
- 符合 Telegram 设计风格

## API 端点

### POST /api/convert-image
**参数**:
- `image`: 图片文件
- `taskId`: 任务 ID（可选，用于进度追踪）

**返回**:
```json
{
  "taskId": "task-xxx",
  "result": {
    "width": 512,
    "height": 512,
    "png": { "url": "/output/xxx.png", "size": 123456 },
    "webp": { "url": "/output/xxx.webp", "size": 12345 }
  }
}
```

### POST /api/convert-video
**参数**:
- `video`: 视频文件或 GIF
- `startTime`: 开始时间（秒）
- `endTime`: 结束时间（秒）
- `taskId`: 任务 ID（可选，用于进度追踪）

**返回**:
```json
{
  "taskId": "task-xxx",
  "result": {
    "url": "/output/xxx.webm",
    "width": 512,
    "height": 512,
    "duration": 3.0,
    "size": 123456,
    "sizeValid": true
  }
}
```

## 配置

### WebSocket 端口
默认使用与 HTTP 服务器相同的端口 (3000)，路径为 `/ws`。

### 连接配置
```javascript
// src/composables/useWebSocket.js
const MAX_RETRIES = 5        // 最大重连次数
const RETRY_DELAY = 3000     // 重连延迟（毫秒）
```

## 兼容性

### 浏览器支持
- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅

### 降级处理
如果 WebSocket 不可用或连接失败，系统会自动降级到传统的 HTTP 轮询模式（虽然不会显示实时进度，但功能仍然可用）。

## 测试

### 测试页面
访问 `http://localhost:3000/test-websocket.html` 可以测试 WebSocket 功能的独立演示页面。

### 测试步骤

1. **启动服务器**:
   ```bash
   npm run dev
   ```

2. **访问主应用**:
   - 打开 `http://localhost:5173`
   - 打开浏览器开发者工具的网络面板
   - 查看 WebSocket 连接（应该看到 `ws://localhost:3000/ws`）

3. **测试图片转换**:
   - 上传一张图片
   - 点击"转换"
   - 观察进度条显示 5 个步骤的进度更新

4. **测试视频转换**:
   - 上传一个视频或 GIF
   - 设置时间范围
   - 点击"转换"
   - 观察进度条显示 0-100% 的实时进度

5. **测试重连**:
   - 转换过程中停止服务器
   - 观察前端尝试重连（最多 5 次）
   - 重启服务器，观察自动重连成功

### 调试

**查看 WebSocket 消息**:
```javascript
// 浏览器控制台
// 已经内置了消息日志，查看 Console 面板
```

**查看服务器日志**:
```bash
# 服务器会输出所有 WebSocket 事件
[INFO] WebSocket client connected: client-xxx
[DEBUG] Client subscribed to task: task-xxx
[DEBUG] Broadcasting progress to 1 clients for task: task-xxx
```

## 性能优化

1. **客户端管理**: 使用 Map 和 Set 高效管理客户端连接和订阅
2. **自动清理**: 客户端断开时自动清理订阅关系
3. **进度节流**: FFmpeg 进度更新已经自然节流（每处理一定帧数更新一次）
4. **消息压缩**: WebSocket 使用 JSON 格式，体积小，传输快

## 安全考虑

1. **任务 ID 验证**: 后端验证任务 ID 格式和权限
2. **消息验证**: 验证客户端发送的消息格式
3. **连接限制**: 可以添加客户端连接数限制（待实现）
4. **认证**: 可以添加 WebSocket 认证机制（待实现）

## 未来改进

- [ ] 添加客户端认证
- [ ] 支持断点续传
- [ ] 添加连接数限制
- [ ] 实现消息队列机制
- [ ] 添加进度持久化（Redis）
- [ ] 支持多服务器负载均衡

## 故障排查

### WebSocket 连接失败

**问题**: 前端显示"未连接"

**解决方案**:
1. 检查服务器是否启动
2. 检查端口 3000 是否被占用
3. 查看浏览器控制台错误信息
4. 确认防火墙没有阻止 WebSocket 连接

### 进度不更新

**问题**: 转换开始但进度条不动

**解决方案**:
1. 检查 WebSocket 连接状态
2. 查看服务器日志确认进度消息发送
3. 确认 `taskId` 正确传递给后端
4. 检查浏览器控制台是否有错误

### 重连失败

**问题**: 服务器重启后无法重连

**解决方案**:
1. 刷新页面重新建立连接
2. 检查重连次数是否超过限制（5次）
3. 等待重连延迟时间（3秒）

## 相关文件

### 后端
- `server.js` - 服务器入口，初始化 WebSocket
- `server/utils/websocket.js` - WebSocket 管理器
- `server/utils/progressTracker.js` - 进度追踪器
- `server/services/imageService.js` - 图片转换服务
- `server/services/videoService.js` - 视频转换服务
- `server/routes/image.js` - 图片转换路由
- `server/routes/video.js` - 视频转换路由

### 前端
- `src/composables/useWebSocket.js` - WebSocket composable
- `src/App.vue` - 主应用组件
- `src/components/StaticStickerPanel.vue` - 静态贴纸面板
- `src/components/VideoStickerPanel.vue` - 视频贴纸面板
- `src/components/BatchItem.vue` - 批处理项组件
- `src/styles/main.css` - 全局样式（包含进度条样式）

### 测试
- `test-websocket.html` - WebSocket 测试页面

## 许可

与项目主体保持一致。
