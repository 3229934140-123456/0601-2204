import { DataAdapter } from '../adapters/adapter';
import { ApiResponse } from '../types/common';
import {
  CommentKeyword,
  NegativeAlert,
  HotSegment,
  SeriesComparison,
  CommentSummaryParams,
  HotSegmentsParams,
  SeriesComparisonParams,
} from '../types/comment';
import { successResponse, errorResponse, ErrorCode } from '../utils/response';

export class CommentService {
  private adapter: DataAdapter;

  constructor(adapter: DataAdapter) {
    this.adapter = adapter;
  }

  async getCommentKeywords(
    params: CommentSummaryParams
  ): Promise<ApiResponse<CommentKeyword[]>> {
    if (!params.workId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '作品ID不能为空');
    }

    try {
      const video = await this.adapter.getVideoDetail(params.workId);
      if (!video) {
        return errorResponse(ErrorCode.WORK_NOT_FOUND, '作品不存在');
      }
      const keywords = await this.adapter.getCommentKeywords(params);
      return successResponse(keywords);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取评论关键词失败');
    }
  }

  async getNegativeAlerts(
    params: CommentSummaryParams
  ): Promise<ApiResponse<NegativeAlert[]>> {
    if (!params.workId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '作品ID不能为空');
    }

    try {
      const video = await this.adapter.getVideoDetail(params.workId);
      if (!video) {
        return errorResponse(ErrorCode.WORK_NOT_FOUND, '作品不存在');
      }
      const alerts = await this.adapter.getNegativeAlerts(params);
      return successResponse(alerts);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取负面提醒失败');
    }
  }

  async getHotSegments(
    params: HotSegmentsParams
  ): Promise<ApiResponse<HotSegment[]>> {
    if (!params.workId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '作品ID不能为空');
    }

    try {
      const video = await this.adapter.getVideoDetail(params.workId);
      if (!video) {
        return errorResponse(ErrorCode.WORK_NOT_FOUND, '作品不存在');
      }
      const segments = await this.adapter.getHotSegments(params);
      return successResponse(segments);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取热门片段失败');
    }
  }

  async getSeriesComparison(
    params: SeriesComparisonParams
  ): Promise<ApiResponse<SeriesComparison[]>> {
    if (!params.accountId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '账号ID不能为空');
    }

    try {
      const account = await this.adapter.getAccount(params.accountId);
      if (!account) {
        return errorResponse(ErrorCode.ACCOUNT_NOT_BOUND, '账号不存在');
      }
      const comparisons = await this.adapter.getSeriesComparison(params);
      return successResponse(comparisons);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取同系列对比失败');
    }
  }

  async getCommentSummary(
    params: CommentSummaryParams
  ): Promise<
    ApiResponse<{
      keywords: CommentKeyword[];
      negativeAlerts: NegativeAlert[];
      totalComments: number;
      positiveRate: number;
      negativeRate: number;
      neutralRate: number;
    }>
  > {
    if (!params.workId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '作品ID不能为空');
    }

    try {
      const video = await this.adapter.getVideoDetail(params.workId);
      if (!video) {
        return errorResponse(ErrorCode.WORK_NOT_FOUND, '作品不存在');
      }

      const [keywords, negativeAlerts] = await Promise.all([
        this.adapter.getCommentKeywords(params),
        this.adapter.getNegativeAlerts(params),
      ]);

      const totalPositive = keywords
        .filter((k) => k.sentiment === 'positive')
        .reduce((sum, k) => sum + k.count, 0);
      const totalNegative = keywords
        .filter((k) => k.sentiment === 'negative')
        .reduce((sum, k) => sum + k.count, 0);
      const totalNeutral = keywords
        .filter((k) => k.sentiment === 'neutral')
        .reduce((sum, k) => sum + k.count, 0);
      const total = totalPositive + totalNegative + totalNeutral;

      return successResponse({
        keywords,
        negativeAlerts,
        totalComments: total + Math.floor(Math.random() * 1000),
        positiveRate: total > 0 ? totalPositive / total : 0,
        negativeRate: total > 0 ? totalNegative / total : 0,
        neutralRate: total > 0 ? totalNeutral / total : 0,
      });
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取评论摘要失败');
    }
  }

  async getFullAnalysis(
    params: CommentSummaryParams
  ): Promise<
    ApiResponse<{
      keywords: CommentKeyword[];
      negativeAlerts: NegativeAlert[];
      hotSegments: HotSegment[];
      sentimentAnalysis: {
        totalComments: number;
        positiveRate: number;
        negativeRate: number;
        neutralRate: number;
      };
    }>
  > {
    if (!params.workId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '作品ID不能为空');
    }

    try {
      const video = await this.adapter.getVideoDetail(params.workId);
      if (!video) {
        return errorResponse(ErrorCode.WORK_NOT_FOUND, '作品不存在');
      }

      const [keywords, negativeAlerts, hotSegments] = await Promise.all([
        this.adapter.getCommentKeywords(params),
        this.adapter.getNegativeAlerts(params),
        this.adapter.getHotSegments({
          workId: params.workId,
          segmentCount: 5,
        }),
      ]);

      const totalPositive = keywords
        .filter((k) => k.sentiment === 'positive')
        .reduce((sum, k) => sum + k.count, 0);
      const totalNegative = keywords
        .filter((k) => k.sentiment === 'negative')
        .reduce((sum, k) => sum + k.count, 0);
      const totalNeutral = keywords
        .filter((k) => k.sentiment === 'neutral')
        .reduce((sum, k) => sum + k.count, 0);
      const total = totalPositive + totalNegative + totalNeutral;

      return successResponse({
        keywords,
        negativeAlerts,
        hotSegments,
        sentimentAnalysis: {
          totalComments: total + Math.floor(Math.random() * 1000),
          positiveRate: total > 0 ? totalPositive / total : 0,
          negativeRate: total > 0 ? totalNegative / total : 0,
          neutralRate: total > 0 ? totalNeutral / total : 0,
        },
      });
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取完整分析失败');
    }
  }
}
