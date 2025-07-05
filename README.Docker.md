# Docker 部署指南

本文档介绍如何使用 Docker 构建和部署 Markdown 服务。

## 快速开始

### 1. 使用 docker-compose（推荐）

```bash
# 一键启动所有服务（包括 MongoDB）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 2. 手动构建和运行

```bash
# 构建镜像
chmod +x build.sh
./build.sh

# 或者手动构建
docker build -t md-svc:latest .

# 运行容器（需要先启动 MongoDB）
docker run -p 3001:3001 -e MONGODB_URI=mongodb://your-mongodb-url md-svc:latest
```

## 文件说明

- `Dockerfile` - 多阶段构建的 Docker 配置文件
- `docker-compose.yml` - 完整的服务编排文件
- `.dockerignore` - Docker 构建时忽略的文件
- `mongo-init.js` - MongoDB 初始化脚本
- `build.sh` - 自动化构建脚本
- `.env.example` - 环境变量示例

## 环境变量

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 服务端口 | `3001` |
| `MONGODB_URI` | MongoDB 连接字符串 | - |
| `CORS_ORIGIN` | 允许的跨域来源 | `http://localhost:3000` |
| `UPLOAD_MAX_SIZE` | 文件上传大小限制 | `10mb` |

## 服务端点

- **健康检查**: `GET /health`
- **API 根路径**: `GET /api/v1/markdowns`
- **主页**: `GET /`

## 数据持久化

MongoDB 数据存储在 Docker volume `mongodb_data` 中，确保数据在容器重启后不会丢失。

## 生产环境部署

1. 复制 `.env.example` 为 `.env` 并修改配置
2. 修改 `docker-compose.yml` 中的密码和敏感信息
3. 使用 `docker-compose -f docker-compose.prod.yml up -d`

## 监控和日志

```bash
# 查看容器状态
docker-compose ps

# 查看应用日志
docker-compose logs -f md-svc

# 查看 MongoDB 日志
docker-compose logs -f mongodb

# 进入容器
docker-compose exec md-svc sh
```

## 故障排除

### 常见问题

1. **端口冲突**: 修改 `docker-compose.yml` 中的端口映射
2. **MongoDB 连接失败**: 检查 `MONGODB_URI` 环境变量
3. **内存不足**: 为 Docker 分配更多内存

### 健康检查

容器包含内置的健康检查，可以通过以下命令查看：

```bash
docker inspect --format='{{json .State.Health}}' md-svc-app
```

## 镜像大小优化

- 使用 Alpine Linux 基础镜像
- 多阶段构建分离构建依赖和运行时依赖
- 清理 npm 缓存
- 使用 .dockerignore 排除不必要的文件

最终镜像大小约为 150MB。 