export interface DailyReport {
  date: string;
  accountId: string;
  summary: {
    totalPlays: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalFavorites: number;
    newFollowers: number;
    publishCount: number;
    avgCompletionRate: number;
  };
  topWorks: TopWorkItem[];
  hourlyDistribution: HourlyData[];
  comparison: DailyComparison;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  accountId: string;
  summary: {
    totalPlays: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalFavorites: number;
    newFollowers: number;
    publishCount: number;
    avgCompletionRate: number;
  };
  dailyTrend: DailyTrendItem[];
  topWorks: TopWorkItem[];
  weekOverWeek: WeekOverWeek;
}

export interface TopicRanking {
  topic: string;
  workCount: number;
  totalPlays: number;
  avgPlays: number;
  totalLikes: number;
  avgInteractRate: number;
  trend: 'up' | 'down' | 'stable';
  ranking: number;
}

export interface AbnormalFluctuation {
  id: string;
  type: 'plays' | 'likes' | 'comments' | 'shares' | 'followers';
  metricName: string;
  date: string;
  currentValue: number;
  expectedValue: number;
  changeRate: number;
  direction: 'up' | 'down';
  severity: 'low' | 'medium' | 'high';
  possibleReasons: string[];
  suggestions: string[];
  relatedWorks: string[];
}

export interface TopWorkItem {
  workId: string;
  title: string;
  coverUrl: string;
  playsCount: number;
  likesCount: number;
  completionRate: number;
}

export interface HourlyData {
  hour: number;
  playsCount: number;
  likesCount: number;
}

export interface DailyComparison {
  playsChangeRate: number;
  likesChangeRate: number;
  commentsChangeRate: number;
  followersChangeRate: number;
}

export interface DailyTrendItem {
  date: string;
  playsCount: number;
  likesCount: number;
  newFollowers: number;
}

export interface WeekOverWeek {
  playsChangeRate: number;
  likesChangeRate: number;
  commentsChangeRate: number;
  followersChangeRate: number;
  publishChangeRate: number;
}

export interface ReportParams {
  accountId: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  weekOffset?: number;
}

export interface TopicRankingParams {
  accountId: string;
  startDate: string;
  endDate: string;
  limit?: number;
  sortBy?: string;
}

export interface AbnormalFluctuationParams {
  accountId: string;
  startDate: string;
  endDate: string;
  severity?: 'low' | 'medium' | 'high';
  metricTypes?: string[];
}
