import { Account, AccountMetrics, AccountListParams, AccountMetricsParams, BindAccountParams } from '../types/account';
import { VideoWork, VideoMetrics, VideoListParams } from '../types/video';
import {
  CommentKeyword,
  NegativeAlert,
  HotSegment,
  SeriesComparison,
  CommentSummaryParams,
  HotSegmentsParams,
  SeriesComparisonParams,
} from '../types/comment';
import {
  DailyReport,
  WeeklyReport,
  TopicRanking,
  AbnormalFluctuation,
  ReportParams,
  TopicRankingParams,
  AbnormalFluctuationParams,
} from '../types/report';
import { PaginationResult } from '../types/common';

export interface DataAdapter {
  bindAccount(params: BindAccountParams): Promise<Account>;
  unbindAccount(accountId: string): Promise<boolean>;
  getAccount(accountId: string): Promise<Account | null>;
  getAccountList(params: AccountListParams): Promise<PaginationResult<Account>>;

  getAccountMetrics(params: AccountMetricsParams): Promise<AccountMetrics[]>;

  getVideoList(params: VideoListParams): Promise<PaginationResult<VideoWork>>;
  getVideoDetail(workId: string): Promise<VideoWork | null>;
  getVideoMetrics(workId: string): Promise<VideoMetrics | null>;

  getCommentKeywords(params: CommentSummaryParams): Promise<CommentKeyword[]>;
  getNegativeAlerts(params: CommentSummaryParams): Promise<NegativeAlert[]>;
  getHotSegments(params: HotSegmentsParams): Promise<HotSegment[]>;
  getSeriesComparison(params: SeriesComparisonParams): Promise<SeriesComparison[]>;

  getDailyReport(params: ReportParams): Promise<DailyReport | null>;
  getWeeklyReport(params: ReportParams): Promise<WeeklyReport | null>;
  getTopicRanking(params: TopicRankingParams): Promise<TopicRanking[]>;
  getAbnormalFluctuations(params: AbnormalFluctuationParams): Promise<AbnormalFluctuation[]>;
}
