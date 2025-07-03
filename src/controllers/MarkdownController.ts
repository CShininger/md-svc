import { Request, Response } from "express";
import { MarkdownModel, IMarkdownDocument } from "../models/MarkdownModel";
import {
  CreateMarkdownRequest,
  UpdateMarkdownRequest,
  MarkdownResponse,
} from "../types/markdown";

export class MarkdownController {
  // 上传/创建markdown文档
  static async uploadMarkdown(req: Request, res: Response): Promise<void> {
    try {
      const {
        title,
        content,
        fileName,
        tags,
        description,
      }: CreateMarkdownRequest = req.body;

      // 验证必填字段
      if (!title || !content || !fileName) {
        res.status(400).json({
          success: false,
          message: "标题、内容和文件名都是必填项",
          error: "MISSING_REQUIRED_FIELDS",
        } as MarkdownResponse);
        return;
      }

      // 计算文件大小
      const fileSize = Buffer.byteLength(content, "utf8");

      // 检查文件大小限制（10MB）
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (fileSize > maxSize) {
        res.status(400).json({
          success: false,
          message: `文件大小超过限制，最大允许${maxSize / (1024 * 1024)}MB`,
          error: "FILE_TOO_LARGE",
        } as MarkdownResponse);
        return;
      }

      // 创建新文档
      const newDocument = new MarkdownModel({
        title: title.trim(),
        content,
        fileName: fileName.trim(),
        fileSize,
        tags: tags || [],
        description: description?.trim() || "",
      });

      // 保存到数据库
      const savedDocument = await newDocument.save();

      res.status(201).json({
        success: true,
        message: "Markdown文档上传成功",
        data: savedDocument,
      } as MarkdownResponse);
    } catch (error: any) {
      console.error("上传markdown文档时出错:", error);

      if (error.name === "ValidationError") {
        res.status(400).json({
          success: false,
          message: "数据验证失败",
          error: error.message,
        } as MarkdownResponse);
      } else if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: "文档已存在",
          error: "DUPLICATE_DOCUMENT",
        } as MarkdownResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "服务器内部错误",
          error: "INTERNAL_SERVER_ERROR",
        } as MarkdownResponse);
      }
    }
  }

  // 获取所有markdown文档（分页）
  static async getAllMarkdowns(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const tag = req.query.tag as string;

      const skip = (page - 1) * limit;

      // 构建查询条件
      let query: any = {};

      if (search) {
        query.$text = { $search: search };
      }

      if (tag) {
        query.tags = { $in: [tag] };
      }

      // 查询文档
      const documents = await MarkdownModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-content") // 列表中不返回完整内容，节省带宽
        .lean();

      // 获取总数
      const total = await MarkdownModel.countDocuments(query);

      res.status(200).json({
        success: true,
        message: "获取文档列表成功",
        data: {
          documents,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error: any) {
      console.error("获取markdown文档列表时出错:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
        error: "INTERNAL_SERVER_ERROR",
      } as MarkdownResponse);
    }
  }

  // 根据ID获取单个markdown文档
  static async getMarkdownById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const document = await MarkdownModel.findById(id);

      if (!document) {
        res.status(404).json({
          success: false,
          message: "文档不存在",
          error: "DOCUMENT_NOT_FOUND",
        } as MarkdownResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: "获取文档成功",
        data: document,
      } as MarkdownResponse);
    } catch (error: any) {
      console.error("获取markdown文档时出错:", error);

      if (error.name === "CastError") {
        res.status(400).json({
          success: false,
          message: "无效的文档ID",
          error: "INVALID_DOCUMENT_ID",
        } as MarkdownResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "服务器内部错误",
          error: "INTERNAL_SERVER_ERROR",
        } as MarkdownResponse);
      }
    }
  }

  // 更新markdown文档
  static async updateMarkdown(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData: UpdateMarkdownRequest = req.body;

      // 如果更新内容，重新计算文件大小
      if (updateData.content) {
        (updateData as any).fileSize = Buffer.byteLength(
          updateData.content,
          "utf8"
        );
      }

      const updatedDocument = await MarkdownModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedDocument) {
        res.status(404).json({
          success: false,
          message: "文档不存在",
          error: "DOCUMENT_NOT_FOUND",
        } as MarkdownResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: "文档更新成功",
        data: updatedDocument,
      } as MarkdownResponse);
    } catch (error: any) {
      console.error("更新markdown文档时出错:", error);

      if (error.name === "ValidationError") {
        res.status(400).json({
          success: false,
          message: "数据验证失败",
          error: error.message,
        } as MarkdownResponse);
      } else if (error.name === "CastError") {
        res.status(400).json({
          success: false,
          message: "无效的文档ID",
          error: "INVALID_DOCUMENT_ID",
        } as MarkdownResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "服务器内部错误",
          error: "INTERNAL_SERVER_ERROR",
        } as MarkdownResponse);
      }
    }
  }

  // 删除markdown文档
  static async deleteMarkdown(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const deletedDocument = await MarkdownModel.findByIdAndDelete(id);

      if (!deletedDocument) {
        res.status(404).json({
          success: false,
          message: "文档不存在",
          error: "DOCUMENT_NOT_FOUND",
        } as MarkdownResponse);
        return;
      }

      res.status(200).json({
        success: true,
        message: "文档删除成功",
        data: deletedDocument,
      } as MarkdownResponse);
    } catch (error: any) {
      console.error("删除markdown文档时出错:", error);

      if (error.name === "CastError") {
        res.status(400).json({
          success: false,
          message: "无效的文档ID",
          error: "INVALID_DOCUMENT_ID",
        } as MarkdownResponse);
      } else {
        res.status(500).json({
          success: false,
          message: "服务器内部错误",
          error: "INTERNAL_SERVER_ERROR",
        } as MarkdownResponse);
      }
    }
  }

  // 搜索markdown文档
  static async searchMarkdowns(req: Request, res: Response): Promise<void> {
    try {
      const { query, limit = 10 } = req.query;

      if (!query) {
        res.status(400).json({
          success: false,
          message: "搜索关键词不能为空",
          error: "MISSING_SEARCH_QUERY",
        } as MarkdownResponse);
        return;
      }

      const searchResults = await MarkdownModel.searchDocuments(
        query as string,
        parseInt(limit as string)
      );

      res.status(200).json({
        success: true,
        message: "搜索完成",
        data: searchResults,
      } as MarkdownResponse);
    } catch (error: any) {
      console.error("搜索markdown文档时出错:", error);
      res.status(500).json({
        success: false,
        message: "服务器内部错误",
        error: "INTERNAL_SERVER_ERROR",
      } as MarkdownResponse);
    }
  }
}
