import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

// MongoDB配置
const databaseConfig: DatabaseConfig = {
  uri:
    process.env.MONGODB_URI ||
    "mongodb://root:root@localhost:27017/next_demo?authSource=admin",
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    connectTimeoutMS: 10000,
    retryWrites: true,
  },
};

// 连接数据库
export const connectDatabase = async (): Promise<void> => {
  try {
    console.log("🔄 正在连接MongoDB数据库...");

    await mongoose.connect(databaseConfig.uri, databaseConfig.options);

    console.log("✅ MongoDB数据库连接成功！");
    console.log(
      `📍 数据库地址: ${databaseConfig.uri.replace(
        /\/\/.*@/,
        "//<credentials>@"
      )}`
    );

    // 监听连接事件
    mongoose.connection.on("error", (error: Error) => {
      console.error("❌ MongoDB连接错误:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB连接断开");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB重新连接成功");
    });
  } catch (error) {
    console.error("❌ MongoDB数据库连接失败:", error);
    console.log("💡 请确保MongoDB服务正在运行");
    console.log("💡 检查连接字符串和认证信息是否正确");
    process.exit(1);
  }
};

// 断开数据库连接
export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log("✅ 数据库连接已关闭");
  } catch (error) {
    console.error("❌ 关闭数据库连接时出错:", error);
  }
};

export default databaseConfig;
