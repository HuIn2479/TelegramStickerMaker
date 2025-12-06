# 使用说明

## 📖 如何使用 WebSocket 实时进度功能

### 在浏览器中测试

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **访问主应用**
   - 打开浏览器访问: http://localhost:5173
   - 应用会自动连接到 WebSocket 服务器

3. **测试图片转换**
   - 切换到"静态贴纸"标签
   - 上传一张或多张图片（PNG/WEBP/JPG）
   - 点击"转换"按钮
   - 观察实时进度条显示：
     - 读取图片信息 (0%)
     - 计算目标尺寸 (20%)
     - 转换为 PNG (40%)
     - 转换为 WEBP (60%)
     - 保存文件 (80%)
     - 完成 (100%)

4. **测试视频转换**
   - 切换到"视频贴纸"标签
   - 上传一个视频文件或 GIF
   - 设置开始和结束时间（≤3秒）
   - 点击"转换"按钮
   - 观察实时进度条从 0% 到 100% 的平滑更新
   - 视频处理会显示 FFmpeg 的实时进度信息

### WebSocket 连接状态

应用会在后台自动管理 WebSocket 连接：

- ✅ **已连接**: 正常显示实时进度
- 🔄 **重连中**: 连接断开时会自动重连（最多5次）
- ❌ **未连接**: 降级到传统模式，功能仍可正常使用（但无实时进度）

### 查看 WebSocket 消息

1. **打开浏览器开发者工具** (F12)
2. **切换到 Network 标签**
3. **筛选 WS (WebSocket)**
4. **点击 ws 连接**
5. **查看 Messages 标签**

你会看到类似这样的消息：

```json
// 连接成功
{"type":"connected","clientId":"client-1764734126205-6mjxijekx"}

// 订阅任务
{"type":"subscribe","taskId":"task-xxx"}

// 进度更新
{
  "type":"progress",
  "taskId":"task-xxx",
  "progress":{
    "percentage":40,
    "message":"转换为 PNG"
  }
}

// 任务完成
{
  "type":"complete",
  "taskId":"task-xxx",
  "result":{
    "width":512,
    "height":512,
    "png":{"url":"/output/xxx.png","size":123456},
    "webp":{"url":"/output/xxx.webp","size":12345}
  }
}
```

### 独立测试页面

如果你想测试 WebSocket 功能而不使用主应用：

1. **访问测试页面**: http://localhost:3000/test-websocket.html
2. **选择图片或视频文件**
3. **点击"开始转换"**
4. **观察实时进度更新**

测试页面提供了一个简化的界面，专门用于演示 WebSocket 实时进度功能。

## 🎯 功能特点

### 实时进度显示

- **图片转换**: 5个步骤，清晰的进度提示
- **视频转换**: 100步进度，基于 FFmpeg 实时回调
- **进度条动画**: 流畅的过渡效果
- **百分比显示**: 精确到整数百分比

### 批量处理

- **多文件上传**: 一次上传多个文件
- **独立进度追踪**: 每个任务有独立的进度条
- **批量转换**: 按顺序处理，每个任务都显示实时进度

### 错误处理

- **转换失败**: 显示错误信息
- **重试功能**: 可以重新尝试失败的任务
- **连接断开**: 自动重连，不影响用户体验

## 🔧 故障排查

### 进度条不显示

**可能原因**:
1. WebSocket 连接失败
2. 服务器未启动
3. 浏览器不支持 WebSocket

**解决方案**:
1. 检查浏览器控制台是否有错误
2. 确认服务器正在运行（查看终端输出）
3. 尝试刷新页面
4. 检查是否有防火墙或代理阻止 WebSocket

### 连接断开频繁

**可能原因**:
1. 网络不稳定
2. 服务器重启
3. 浏览器限制

**解决方案**:
1. 检查网络连接
2. 查看服务器日志
3. 尝试使用不同的浏览器
4. 增加重连次数和延迟时间（修改 `src/composables/useWebSocket.js`）

### 进度卡住不动

**可能原因**:
1. 文件处理时间过长
2. 服务器资源不足
3. FFmpeg 处理失败

**解决方案**:
1. 等待更长时间（大文件需要更多时间）
2. 检查服务器 CPU 和内存使用
3. 查看服务器日志中的错误信息
4. 尝试使用更小的文件

## 📊 性能优化建议

### 服务器端

1. **增加并发处理**
   - 修改 `server/config/index.js` 中的并发限制
   - 根据服务器性能调整

2. **优化 FFmpeg 参数**
   - 调整 `-preset` 参数（faster/fast/medium）
   - 平衡速度和质量

3. **缓存策略**
   - 考虑添加 Redis 缓存进度信息
   - 避免重复转换相同文件

### 客户端

1. **限制上传数量**
   - 图片: 建议不超过 20 个
   - 视频: 建议不超过 10 个

2. **文件大小限制**
   - 图片: < 10MB
   - 视频: < 50MB

3. **批量处理延迟**
   - 已设置图片 100ms、视频 200ms 延迟
   - 避免服务器过载

## 🎨 自定义配置

### 修改进度更新频率

编辑 `server/services/videoService.js`:

```javascript
// 减少进度更新频率（节省带宽）
if (Math.floor(percent) % 5 === 0) {  // 每5%更新一次
  onProgress?.(Math.floor(percent), `处理中: ${progress.timemark}`)
}
```

### 修改重连设置

编辑 `src/composables/useWebSocket.js`:

```javascript
const MAX_RETRIES = 10      // 增加到10次
const RETRY_DELAY = 5000    // 增加到5秒
```

### 修改进度条样式

编辑 `src/styles/main.css`:

```css
.progress-fill {
  background: linear-gradient(90deg, #ff6b6b 0%, #ee5a6f 100%); /* 红色主题 */
}
```

## 🚀 生产部署

### 注意事项

1. **WebSocket 代理**
   - Nginx 需要配置 WebSocket 支持
   - 添加 `proxy_set_header Upgrade $http_upgrade;`
   - 添加 `proxy_set_header Connection "upgrade";`

2. **HTTPS 支持**
   - WebSocket 在 HTTPS 下使用 WSS 协议
   - 确保 SSL 证书配置正确

3. **负载均衡**
   - WebSocket 需要会话保持（sticky sessions）
   - 考虑使用 Redis 作为消息中间件

### Nginx 配置示例

```nginx
location /ws {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_read_timeout 86400;
}
```

## 📚 更多资源

- **WebSocket 详细文档**: [WEBSOCKET.md](./WEBSOCKET.md)
- **项目架构**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **更新日志**: [CHANGELOG.md](./CHANGELOG.md)
- **主要文档**: [README.md](./README.md)

## 💡 提示和技巧

1. **保持浏览器标签活跃**: 某些浏览器在标签不活跃时可能暂停 WebSocket
2. **使用现代浏览器**: 推荐 Chrome/Edge/Firefox 最新版本
3. **检查开发者工具**: Network 和 Console 标签提供有用的调试信息
4. **阅读服务器日志**: 后端日志详细记录了所有 WebSocket 事件

## ❓ 常见问题

**Q: WebSocket 连接一直断开？**
A: 检查防火墙设置，确保端口 3000 未被阻止。

**Q: 进度显示不准确？**
A: 视频处理进度基于 FFmpeg 估算，可能与实际略有偏差。

**Q: 支持多少个并发连接？**
A: 理论上无限制，但建议根据服务器性能限制并发处理数量。

**Q: 可以在移动设备上使用吗？**
A: 可以，WebSocket 在现代移动浏览器上完全支持。

## 🤝 贡献

如果你发现任何问题或有改进建议，欢迎：
- 提交 Issue
- 创建 Pull Request
- 联系项目维护者

---

享受实时进度追踪带来的流畅体验！ 🎉
