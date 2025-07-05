import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User";
import {
  CreateUserData,
  LoginData,
  AuthResponse,
  JWTPayload,
} from "../types/user";
import Joi from "joi";

// JWT密钥
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// 验证规则
const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export class AuthController {
  // 用户注册
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // 验证输入数据
      const { error } = registerSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message,
        } as AuthResponse);
        return;
      }

      const {
        username,
        email,
        password,
      }: CreateUserData & { confirmPassword: string } = req.body;

      // 检查用户是否已存在
      const { usernameExists, emailExists } = await UserModel.checkExistence(
        username,
        email
      );

      if (usernameExists || emailExists) {
        res.status(409).json({
          success: false,
          message: usernameExists ? "用户名已存在" : "邮箱已存在",
        } as AuthResponse);
        return;
      }

      // 加密密码
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // 创建用户
      const user = await UserModel.create({
        username,
        email,
        password,
        password_hash,
      });

      // 生成JWT令牌
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          username: user.username,
        } as JWTPayload,
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.status(201).json({
        success: true,
        message: "注册成功",
        user: UserModel.toResponse(user),
        token,
      } as AuthResponse);
    } catch (error) {
      console.error("注册错误:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      } as AuthResponse);
    }
  }

  // 用户登录
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // 验证输入数据
      const { error } = loginSchema.validate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: error.details[0].message,
        } as AuthResponse);
        return;
      }

      const { email, password }: LoginData = req.body;

      // 查找用户
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          message: "邮箱或密码错误",
        } as AuthResponse);
        return;
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: "邮箱或密码错误",
        } as AuthResponse);
        return;
      }

      // 生成JWT令牌
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          username: user.username,
        } as JWTPayload,
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      res.json({
        success: true,
        message: "登录成功",
        user: UserModel.toResponse(user),
        token,
      } as AuthResponse);
    } catch (error) {
      console.error("登录错误:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      } as AuthResponse);
    }
  }

  // 获取当前用户信息
  static async me(req: Request, res: Response): Promise<void> {
    try {
      // 从中间件获取用户信息
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "未授权",
        } as AuthResponse);
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "用户不存在",
        } as AuthResponse);
        return;
      }

      res.json({
        success: true,
        message: "获取用户信息成功",
        user: UserModel.toResponse(user),
      } as AuthResponse);
    } catch (error) {
      console.error("获取用户信息错误:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
      } as AuthResponse);
    }
  }

  // 注销（清除客户端token即可）
  static async logout(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      message: "注销成功",
    } as AuthResponse);
  }
}
