export interface MarkdownDocument {
  _id?: string;
  title: string;
  content: string;
  fileName: string;
  fileSize: number;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  description?: string;
}

export interface CreateMarkdownRequest {
  title: string;
  content: string;
  fileName: string;
  tags?: string[];
  description?: string;
}

export interface UpdateMarkdownRequest {
  title?: string;
  content?: string;
  tags?: string[];
  description?: string;
}

export interface MarkdownListResponse {
  documents: MarkdownDocument[];
  total: number;
  page: number;
  limit: number;
}

export interface MarkdownResponse {
  success: boolean;
  message: string;
  data?: any; // 使用 any 类型以兼容 mongoose Document 类型
  error?: string;
}
