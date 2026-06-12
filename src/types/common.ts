export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: number;
  requestId: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginationResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export type ReportType = 'daily' | 'weekly' | 'monthly';

export type Platform = 'douyin' | 'kuaishou' | 'xiaohongshu' | 'bilibili' | 'wechat';

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}
