import { Platform } from './common';

export interface Account {
  accountId: string;
  platform: Platform;
  accountName: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  totalWorksCount: number;
  totalLikesCount: number;
  totalPlaysCount: number;
  bio: string;
  isVerified: boolean;
  bindTime: number;
  status: 'active' | 'inactive' | 'pending';
}

export interface AccountMetrics {
  accountId: string;
  date: string;
  playsCount: number;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  favoritesCount: number;
  newFollowersCount: number;
  totalFollowersCount: number;
  completionRate: number;
  avgWatchDuration: number;
  publishCount: number;
}

export interface BindAccountParams {
  platform: Platform;
  authCode: string;
  redirectUri?: string;
}

export interface AccountListParams {
  platform?: Platform;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface AccountMetricsParams {
  accountId: string;
  startDate: string;
  endDate: string;
}
