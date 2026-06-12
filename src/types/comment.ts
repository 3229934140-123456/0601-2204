export interface CommentKeyword {
  keyword: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  trend: 'up' | 'down' | 'stable';
}

export interface NegativeAlert {
  type: string;
  level: 'low' | 'medium' | 'high';
  count: number;
  description: string;
  exampleComments: string[];
  suggestion: string;
}

export interface HotSegment {
  segmentId: string;
  startTime: number;
  endTime: number;
  description: string;
  heatIndex: number;
  retentionRate: number;
  commentCount: number;
}

export interface SeriesComparison {
  seriesId: string;
  seriesName: string;
  workCount: number;
  avgPlays: number;
  avgLikes: number;
  avgCompletionRate: number;
  avgInteractRate: number;
  growthRate: number;
}

export interface CommentSummaryParams {
  workId: string;
  keywordLimit?: number;
  alertLevel?: 'low' | 'medium' | 'high';
}

export interface HotSegmentsParams {
  workId: string;
  segmentCount?: number;
}

export interface SeriesComparisonParams {
  accountId: string;
  sortBy?: string;
}
