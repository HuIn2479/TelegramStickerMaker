# Docker 部署指南

## 快速开始

### 使用 Docker Compose（推荐）

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止
docker-compose down
```

访问：<http://localhost:3000>

### 使用 Docker

```bash
# 构建镜像
docker build -t telegram-sticker-maker .

# 运行容器
docker run -d \
  --name telegram-sticker-maker \
  -p 3000:3000 \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/output:/app/output \
  telegram-sticker-maker

# 查看日志
docker logs -f telegram-sticker-maker

# 停止容器
docker stop telegram-sticker-maker

# 删除容器
docker rm telegram-sticker-maker
```

## 配置说明

### 端口映射

- 默认端口：`3000`
- 修改端口：编辑 `docker-compose.yml` 中的 `ports` 配置

### 数据持久化

以下目录通过 volume 挂载到宿主机：

- `uploads/` - 上传的原始文件
- `output/` - 转换后的文件

### 环境变量

- `NODE_ENV=production` - 生产环境模式

## 常用命令

```bash
# 重新构建
docker-compose build --no-cache

# 重启服务
docker-compose restart

# 查看运行状态
docker-compose ps

# 进入容器
docker-compose exec telegram-sticker-maker sh

# 清理数据
docker-compose down -v
```

## 生产部署建议

### 1. 使用反向代理（Nginx）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
```

### 2. 启用 HTTPS

```bash
# 使用 Let's Encrypt
docker run -it --rm \
  -v /etc/letsencrypt:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d your-domain.com
```

### 3. 资源限制

在 `docker-compose.yml` 中添加：

```yaml
services:
  telegram-sticker-maker:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
        reservations:
          cpus: "1"
          memory: 1G
```

### 4. 自动清理

添加定时任务清理旧文件：

```bash
# 在宿主机上设置 crontab
0 * * * * find /path/to/uploads -type f -mtime +1 -delete
0 * * * * find /path/to/output -type f -mtime +1 -delete
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker-compose logs

# 检查端口占用
netstat -tulpn | grep 3000
```

### FFmpeg 错误

```bash
# 进入容器检查 FFmpeg
docker-compose exec telegram-sticker-maker ffmpeg -version
```

### 磁盘空间不足

```bash
# 清理 Docker 资源
docker system prune -a

# 手动清理上传文件
docker-compose exec telegram-sticker-maker sh -c "rm -rf /app/uploads/* /app/output/*"
```

## 更新应用

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建并启动
docker-compose up -d --build

# 3. 清理旧镜像
docker image prune -f
```
