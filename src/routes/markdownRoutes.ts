import { Router } from "express";
import { MarkdownController } from "../controllers/MarkdownController";

const router = Router();

// 创建/上传markdown文档
router.post("/", MarkdownController.uploadMarkdown);

// 获取所有markdown文档（分页查询）
router.get("/", MarkdownController.getAllMarkdowns);

// 搜索markdown文档
router.get("/search", MarkdownController.searchMarkdowns);

// 根据ID获取单个markdown文档
router.get("/:id", MarkdownController.getMarkdownById);

// 更新markdown文档
router.put("/:id", MarkdownController.updateMarkdown);

// 删除markdown文档
router.delete("/:id", MarkdownController.deleteMarkdown);

export default router;
