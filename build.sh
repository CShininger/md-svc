#!/bin/bash

# 设置镜像名称和标签
IMAGE_NAME="md-svc"
VERSION="1.0.0"
REGISTRY=""  # 如果需要推送到镜像仓库，在这里设置

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 开始构建 Docker 镜像...${NC}"

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker 没有运行，请先启动 Docker${NC}"
    exit 1
fi

# 构建镜像
echo -e "${BLUE}📦 构建镜像: ${IMAGE_NAME}:${VERSION}${NC}"
docker build -t ${IMAGE_NAME}:${VERSION} -t ${IMAGE_NAME}:latest .

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 镜像构建成功！${NC}"
    
    # 显示镜像信息
    echo -e "${BLUE}📋 镜像信息:${NC}"
    docker images | grep ${IMAGE_NAME}
    
    echo -e "${YELLOW}💡 运行命令:${NC}"
    echo "   单独运行: docker run -p 3001:3001 ${IMAGE_NAME}:latest"
    echo "   使用 docker-compose: docker-compose up -d"
    
    echo -e "${YELLOW}💡 其他有用命令:${NC}"
    echo "   查看日志: docker-compose logs -f md-svc"
    echo "   停止服务: docker-compose down"
    echo "   重新构建: docker-compose up --build -d"
    
    if [ ! -z "$REGISTRY" ]; then
        echo -e "${YELLOW}📤 推送到镜像仓库? (y/n)${NC}"
        read -r response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            echo -e "${BLUE}📤 推送镜像到 ${REGISTRY}...${NC}"
            docker tag ${IMAGE_NAME}:${VERSION} ${REGISTRY}/${IMAGE_NAME}:${VERSION}
            docker tag ${IMAGE_NAME}:latest ${REGISTRY}/${IMAGE_NAME}:latest
            docker push ${REGISTRY}/${IMAGE_NAME}:${VERSION}
            docker push ${REGISTRY}/${IMAGE_NAME}:latest
            echo -e "${GREEN}✅ 镜像推送成功！${NC}"
        fi
    fi
else
    echo -e "${RED}❌ 镜像构建失败！${NC}"
    exit 1
fi 