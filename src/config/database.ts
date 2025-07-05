import mongoose from "mongoose";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

interface DatabaseConfig {
  uri: string;
  options: mongoose.ConnectOptions;
}

// MongoDB配置
const databaseConfig: DatabaseConfig = {
  uri:
    process.env.MONGODB_URI ||
    "mongodb://root:root@localhost:27017/markdown_db?authSource=admin",
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    connectTimeoutMS: 10000,
    retryWrites: true,
  },
};

// 连接数据库（可选，不影响服务启动）
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
    console.log("💡 MongoDB不可用，但服务将继续启动（使用MySQL进行用户认证）");
    console.log("💡 如需使用博客文章功能，请确保MongoDB服务正在运行");
    // 不再退出进程，允许服务继续启动
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

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306"),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "next_user",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// 创建连接池
export const pool = mysql.createPool(dbConfig);

// 初始化数据库和表
export async function initDatabase() {
  try {
    // 创建数据库（如果不存在）
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await tempConnection.execute(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
    );
    await tempConnection.end();

    // 创建用户表
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ 数据库和用户表初始化成功");
  } catch (error) {
    console.error("❌ 数据库初始化失败:", error);
    throw error;
  }
}

// 测试数据库连接
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ MySQL 数据库连接成功");
    connection.release();
  } catch (error) {
    console.error("❌ MySQL 数据库连接失败:", error);
    throw error;
  }
}
