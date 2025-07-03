import { Request, Response, NextFunction } from "express";

// 验证创建markdown请求
export const validateCreateMarkdown = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, content, fileName } = req.body;

  const errors: string[] = [];

  // 验证标题
  if (!title || typeof title !== "string") {
    errors.push("标题是必填项且必须是字符串");
  } else if (title.trim().length === 0) {
    errors.push("标题不能为空");
  } else if (title.length > 200) {
    errors.push("标题长度不能超过200个字符");
  }

  // 验证内容
  if (!content || typeof content !== "string") {
    errors.push("内容是必填项且必须是字符串");
  } else if (content.trim().length === 0) {
    errors.push("内容不能为空");
  } else if (content.length > 1000000) {
    errors.push("内容长度不能超过1MB");
  }

  // 验证文件名
  if (!fileName || typeof fileName !== "string") {
    errors.push("文件名是必填项且必须是字符串");
  } else if (fileName.trim().length === 0) {
    errors.push("文件名不能为空");
  } else if (fileName.length > 255) {
    errors.push("文件名长度不能超过255个字符");
  } else if (!/\.(md|markdown)$/i.test(fileName)) {
    errors.push("文件名必须以.md或.markdown结尾");
  }

  // 验证标签（可选）
  if (req.body.tags && !Array.isArray(req.body.tags)) {
    errors.push("标签必须是数组格式");
  } else if (req.body.tags && req.body.tags.length > 20) {
    errors.push("标签数量不能超过20个");
  }

  // 验证描述（可选）
  if (req.body.description && typeof req.body.description !== "string") {
    errors.push("描述必须是字符串");
  } else if (req.body.description && req.body.description.length > 500) {
    errors.push("描述长度不能超过500个字符");
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "请求数据验证失败",
      error: "VALIDATION_ERROR",
      details: errors,
    });
    return;
  }

  next();
};

// 验证更新markdown请求
export const validateUpdateMarkdown = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, content, tags, description } = req.body;

  const errors: string[] = [];

  // 验证标题（可选更新）
  if (title !== undefined) {
    if (typeof title !== "string") {
      errors.push("标题必须是字符串");
    } else if (title.trim().length === 0) {
      errors.push("标题不能为空");
    } else if (title.length > 200) {
      errors.push("标题长度不能超过200个字符");
    }
  }

  // 验证内容（可选更新）
  if (content !== undefined) {
    if (typeof content !== "string") {
      errors.push("内容必须是字符串");
    } else if (content.trim().length === 0) {
      errors.push("内容不能为空");
    } else if (content.length > 1000000) {
      errors.push("内容长度不能超过1MB");
    }
  }

  // 验证标签（可选更新）
  if (tags !== undefined) {
    if (!Array.isArray(tags)) {
      errors.push("标签必须是数组格式");
    } else if (tags.length > 20) {
      errors.push("标签数量不能超过20个");
    }
  }

  // 验证描述（可选更新）
  if (description !== undefined) {
    if (typeof description !== "string") {
      errors.push("描述必须是字符串");
    } else if (description.length > 500) {
      errors.push("描述长度不能超过500个字符");
    }
  }

  if (errors.length > 0) {
    res.status(400).json({
      success: false,
      message: "请求数据验证失败",
      error: "VALIDATION_ERROR",
      details: errors,
    });
    return;
  }

  next();
};

// 验证MongoDB ObjectId格式
export const validateObjectId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.params;

  // 简单的ObjectId格式验证（24位十六进制字符）
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!objectIdRegex.test(id)) {
    res.status(400).json({
      success: false,
      message: "无效的文档ID格式",
      error: "INVALID_OBJECT_ID",
    });
    return;
  }

  next();
};
