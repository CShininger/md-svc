import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// 用户注册
router.post("/register", AuthController.register);

// 用户登录
router.post("/login", AuthController.login);

// 用户注销
router.post("/logout", AuthController.logout);

// 获取当前用户信息 (需要认证)
router.get("/me", authenticateToken, AuthController.me);

export default router;
