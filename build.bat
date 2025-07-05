@echo off
setlocal enabledelayedexpansion

REM 设置镜像名称和标签
set IMAGE_NAME=md-svc
set VERSION=1.0.0
set REGISTRY=

echo 🚀 开始构建 Docker 镜像...

REM 检查 Docker 是否运行
docker info >nul 2>&1
if !errorlevel! neq 0 (
    echo ❌ Docker 没有运行，请先启动 Docker
    exit /b 1
)

REM 构建镜像
echo 📦 构建镜像: %IMAGE_NAME%:%VERSION%
docker build -t %IMAGE_NAME%:%VERSION% -t %IMAGE_NAME%:latest .

if !errorlevel! equ 0 (
    echo ✅ 镜像构建成功！
    
    echo.
    echo 📋 镜像信息:
    docker images | findstr %IMAGE_NAME%
    
    echo.
    echo 💡 运行命令:
    echo    单独运行: docker run -p 3001:3001 %IMAGE_NAME%:latest
    echo    使用 docker-compose: docker-compose up -d
    
    echo.
    echo 💡 其他有用命令:
    echo    查看日志: docker-compose logs -f md-svc
    echo    停止服务: docker-compose down
    echo    重新构建: docker-compose up --build -d
    
    if not "%REGISTRY%"=="" (
        set /p response="📤 推送到镜像仓库? (y/n): "
        if /i "!response!"=="y" (
            echo 📤 推送镜像到 %REGISTRY%...
            docker tag %IMAGE_NAME%:%VERSION% %REGISTRY%/%IMAGE_NAME%:%VERSION%
            docker tag %IMAGE_NAME%:latest %REGISTRY%/%IMAGE_NAME%:latest
            docker push %REGISTRY%/%IMAGE_NAME%:%VERSION%
            docker push %REGISTRY%/%IMAGE_NAME%:latest
            echo ✅ 镜像推送成功！
        )
    )
) else (
    echo ❌ 镜像构建失败！
    exit /b 1
)

pause 