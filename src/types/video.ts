import { Platform } from './common';

export interface VideoWork {
  workId: string;
  accountId: string;
  platform: Platform;
  title: string;
  description: string;
  coverUrl: string;
  videoUrl: string;
  duration: number;
  publishTime: number;
  tags: string[];
  seriesId?: string;
  seriesName?: string;
  status: 'published' | 'draft' | 'reviewing' | 'failed';
}

export interface VideoMetrics {
  workId: string;
  playsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  favoritesCount: number;
  completionRate: number;
  avgWatchDuration: number;
  playDuration: number;
  newFollowersCount: number;
  collectRate: number;
  interactRate: number;
}

export interface VideoListParams {
  accountId?: string;
  seriesId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
  tags?: string[];
}
