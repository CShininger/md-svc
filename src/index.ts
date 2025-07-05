import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";

import { connectDatabase } from "./config/database";
import { initDatabase, testConnection } from "./config/database";
import markdownRoutes from "./routes/markdownRoutes";
import authRoutes from "./routes/auth";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// 加载环境变量
dotenv.config();

// 创建Express应用
const app: Application = express();
const PORT = process.env.PORT || 3001;
const API_PREFIX = process.env.API_PREFIX || "/api/v1";

// 中间件配置
app.use(helmet()); // 安全中间件
app.use(compression()); // 压缩中间件

// CORS配置
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// 解析JSON请求体
app.use(
  express.json({
    limit: process.env.UPLOAD_MAX_SIZE || "10mb",
  })
);

// 解析URL编码的请求体
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.UPLOAD_MAX_SIZE || "10mb",
  })
);

// 健康检查路由
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "服务运行正常",
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    },
  });
});

// API路由
app.use(`${API_PREFIX}/markdowns`, markdownRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);

// 根路由
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "欢迎使用Markdown文档管理API",
    data: {
      name: "Next Demo Service",
      version: "1.0.0",
      description: "用于处理Markdown文件上传和获取的后端API服务",
      endpoints: {
        health: "/health",
        markdowns: `${API_PREFIX}/markdowns`,
        auth: `${API_PREFIX}/auth`,
        docs: "/docs", // 未来可添加API文档
      },
    },
  });
});

// 404错误处理
app.use(notFoundHandler);

// 全局错误处理
app.use(errorHandler);

// 启动服务器
const startServer = async (): Promise<void> => {
  try {
    // 连接MongoDB数据库
    await connectDatabase();

    // 连接和初始化MySQL数据库
    await testConnection();
    await initDatabase();

    // 启动服务器
    app.listen(PORT, () => {
      console.log("🚀 服务器启动成功！");
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`🔗 API接口: http://localhost:${PORT}${API_PREFIX}`);
      console.log(`💚 健康检查: http://localhost:${PORT}/health`);
      console.log(
        `📝 Markdown API: http://localhost:${PORT}${API_PREFIX}/markdowns`
      );
      console.log(`🔐 认证 API: http://localhost:${PORT}${API_PREFIX}/auth`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || "development"}`);
      console.log("💡 按 Ctrl+C 停止服务器");
    });
  } catch (error) {
    console.error("❌ 服务器启动失败:", error);
    process.exit(1);
  }
};

// 优雅关闭处理
process.on("SIGTERM", () => {
  console.log("🔄 收到SIGTERM信号，正在优雅关闭服务器...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🔄 收到SIGINT信号，正在优雅关闭服务器...");
  process.exit(0);
});

// 未捕获的异常处理
process.on("uncaughtException", (error) => {
  console.error("❌ 未捕获的异常:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ 未处理的Promise拒绝:", reason);
  console.error("Promise:", promise);
  process.exit(1);
});

// 启动服务器
startServer();

export default app;
