import { pool } from "../config/database";
import { User, CreateUserData, UserResponse } from "../types/user";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export class UserModel {
  // 根据邮箱查找用户
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as User;
    } catch (error) {
      console.error("查找用户失败:", error);
      throw error;
    }
  }

  // 根据用户名查找用户
  static async findByUsername(username: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as User;
    } catch (error) {
      console.error("查找用户失败:", error);
      throw error;
    }
  }

  // 根据ID查找用户
  static async findById(id: number): Promise<User | null> {
    try {
      const [rows] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM users WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      return rows[0] as User;
    } catch (error) {
      console.error("查找用户失败:", error);
      throw error;
    }
  }

  // 创建新用户
  static async create(
    userData: CreateUserData & { password_hash: string }
  ): Promise<User> {
    try {
      const [result] = await pool.execute<ResultSetHeader>(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        [userData.username, userData.email, userData.password_hash]
      );

      const user = await this.findById(result.insertId);
      if (!user) {
        throw new Error("创建用户后查找失败");
      }

      return user;
    } catch (error) {
      console.error("创建用户失败:", error);
      throw error;
    }
  }

  // 检查用户名或邮箱是否已存在
  static async checkExistence(
    username: string,
    email: string
  ): Promise<{ usernameExists: boolean; emailExists: boolean }> {
    try {
      const [usernameRows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM users WHERE username = ?",
        [username]
      );

      const [emailRows] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      return {
        usernameExists: usernameRows.length > 0,
        emailExists: emailRows.length > 0,
      };
    } catch (error) {
      console.error("检查用户存在性失败:", error);
      throw error;
    }
  }

  // 将用户对象转换为响应格式（去除敏感信息）
  static toResponse(user: User): UserResponse {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
