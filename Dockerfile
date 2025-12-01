# 构建阶段
FROM node:25-alpine AS builder

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装所有依赖（包括 devDependencies，用于构建）
# 明确不设置 NODE_ENV，确保安装 devDependencies
RUN npm install && \
    echo "Checking vite installation:" && \
    npm list vite || true

# 复制源代码
COPY . .

# 构建前端
RUN npm run build

# 生产阶段
FROM node:25-alpine

# 安装 FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 只安装生产依赖
RUN npm ci --only=production

# 从构建阶段复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# 创建必要的目录
RUN mkdir -p uploads output

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV=production

# 启动应用
CMD ["node", "server.js"]
