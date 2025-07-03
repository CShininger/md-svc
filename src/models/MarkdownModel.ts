import mongoose, { Document, Schema, Model } from "mongoose";
import { MarkdownDocument } from "../types/markdown";

// 扩展接口以包含MongoDB Document方法
export interface IMarkdownDocument
  extends Omit<MarkdownDocument, "_id">,
    Document {
  _id: mongoose.Types.ObjectId;
  getSummary(): string;
}

// 静态方法接口
export interface IMarkdownModel extends Model<IMarkdownDocument> {
  findByTag(tag: string): Promise<IMarkdownDocument[]>;
  searchDocuments(query: string, limit?: number): Promise<IMarkdownDocument[]>;
}

// 创建MongoDB Schema
const MarkdownSchema: Schema<IMarkdownDocument> = new Schema(
  {
    title: {
      type: String,
      required: [true, "标题不能为空"],
      trim: true,
      maxlength: [200, "标题长度不能超过200个字符"],
    },
    content: {
      type: String,
      required: [true, "Markdown内容不能为空"],
      maxlength: [1000000, "内容长度不能超过1MB"], // 1MB限制
    },
    fileName: {
      type: String,
      required: [true, "文件名不能为空"],
      trim: true,
      maxlength: [255, "文件名长度不能超过255个字符"],
    },
    fileSize: {
      type: Number,
      required: [true, "文件大小不能为空"],
      min: [0, "文件大小不能为负数"],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 20; // 最多20个标签
        },
        message: "标签数量不能超过20个",
      },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "描述长度不能超过500个字符"],
      default: "",
    },
  },
  {
    timestamps: true, // 自动添加createdAt和updatedAt字段
    versionKey: false, // 移除__v字段
  }
);

// 创建索引以提高查询性能
MarkdownSchema.index({ title: "text", content: "text", tags: "text" }); // 全文搜索索引
MarkdownSchema.index({ createdAt: -1 }); // 创建时间降序索引
MarkdownSchema.index({ tags: 1 }); // 标签索引

// 实例方法：获取文档摘要
MarkdownSchema.methods.getSummary = function (): string {
  const maxLength = 200;
  if (this.content.length <= maxLength) {
    return this.content;
  }
  return this.content.substring(0, maxLength) + "...";
};

// 静态方法：按标签查找文档
MarkdownSchema.statics.findByTag = function (tag: string) {
  return this.find({ tags: { $in: [tag] } }).sort({ createdAt: -1 });
};

// 静态方法：全文搜索
MarkdownSchema.statics.searchDocuments = function (
  query: string,
  limit: number = 10
) {
  return this.find(
    { $text: { $search: query } },
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" } })
    .limit(limit);
};

// 预处理中间件：保存前验证和处理
MarkdownSchema.pre<IMarkdownDocument>("save", function (next) {
  // 自动计算文件大小（如果没有提供）
  if (!this.fileSize && this.content) {
    this.fileSize = Buffer.byteLength(this.content, "utf8");
  }

  // 清理标签：去重、去空格、转小写
  if (this.tags && this.tags.length > 0) {
    this.tags = [
      ...new Set(
        this.tags
          .map((tag) => tag.trim().toLowerCase())
          .filter((tag) => tag.length > 0)
      ),
    ];
  }

  next();
});

// 创建并导出模型
export const MarkdownModel = mongoose.model<IMarkdownDocument, IMarkdownModel>(
  "Markdown",
  MarkdownSchema
);

export default MarkdownModel;
