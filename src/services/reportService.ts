import { DataAdapter } from '../adapters/adapter';
import { ApiResponse } from '../types/common';
import {
  DailyReport,
  WeeklyReport,
  TopicRanking,
  AbnormalFluctuation,
  ReportParams,
  TopicRankingParams,
  AbnormalFluctuationParams,
} from '../types/report';
import { successResponse, errorResponse, ErrorCode } from '../utils/response';
import { formatDate, getDateRange, getWeekRange, validateDateRange } from '../utils/helper';

export class ReportService {
  private adapter: DataAdapter;

  constructor(adapter: DataAdapter) {
    this.adapter = adapter;
  }

  async getDailyReport(params: ReportParams): Promise<ApiResponse<DailyReport | null>> {
    if (!params.accountId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '账号ID不能为空');
    }

    try {
      const account = await this.adapter.getAccount(params.accountId);
      if (!account) {
        return errorResponse(ErrorCode.ACCOUNT_NOT_BOUND, '账号不存在');
      }
      const report = await this.adapter.getDailyReport(params);
      if (!report) {
        return errorResponse(ErrorCode.NOT_FOUND, '日报不存在');
      }
      return successResponse(report);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取日报失败');
    }
  }

  async getWeeklyReport(params: ReportParams): Promise<ApiResponse<WeeklyReport | null>> {
    if (!params.accountId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '账号ID不能为空');
    }

    try {
      const account = await this.adapter.getAccount(params.accountId);
      if (!account) {
        return errorResponse(ErrorCode.ACCOUNT_NOT_BOUND, '账号不存在');
      }
      const report = await this.adapter.getWeeklyReport(params);
      if (!report) {
        return errorResponse(ErrorCode.NOT_FOUND, '周报不存在');
      }
      return successResponse(report);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取周报失败');
    }
  }

  async getTopicRanking(
    params: TopicRankingParams
  ): Promise<ApiResponse<TopicRanking[]>> {
    if (!params.accountId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '账号ID不能为空');
    }
    if (!params.startDate || !params.endDate) {
      return errorResponse(ErrorCode.PARAM_ERROR, '开始日期和结束日期不能为空');
    }
    const dateError = validateDateRange(params.startDate, params.endDate);
    if (dateError) {
      return errorResponse(ErrorCode.PARAM_ERROR, dateError);
    }

    try {
      const account = await this.adapter.getAccount(params.accountId);
      if (!account) {
        return errorResponse(ErrorCode.ACCOUNT_NOT_BOUND, '账号不存在');
      }
      const rankings = await this.adapter.getTopicRanking(params);
      return successResponse(rankings);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取选题排行失败');
    }
  }

  async getAbnormalFluctuations(
    params: AbnormalFluctuationParams
  ): Promise<ApiResponse<AbnormalFluctuation[]>> {
    if (!params.accountId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '账号ID不能为空');
    }
    if (!params.startDate || !params.endDate) {
      return errorResponse(ErrorCode.PARAM_ERROR, '开始日期和结束日期不能为空');
    }
    const dateError = validateDateRange(params.startDate, params.endDate);
    if (dateError) {
      return errorResponse(ErrorCode.PARAM_ERROR, dateError);
    }

    try {
      const account = await this.adapter.getAccount(params.accountId);
      if (!account) {
        return errorResponse(ErrorCode.ACCOUNT_NOT_BOUND, '账号不存在');
      }
      const fluctuations = await this.adapter.getAbnormalFluctuations(params);
      return successResponse(fluctuations);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取异常波动失败');
    }
  }

  async getRecentDailyReports(params: {
    accountId: string;
    days?: number;
  }): Promise<ApiResponse<DailyReport[]>> {
    if (!params.accountId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '账号ID不能为空');
    }

    try {
      const account = await this.adapter.getAccount(params.accountId);
      if (!account) {
        return errorResponse(ErrorCode.ACCOUNT_NOT_BOUND, '账号不存在');
      }

      const days = params.days || 7;
      const reports: DailyReport[] = [];

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const report = await this.adapter.getDailyReport({
          accountId: params.accountId,
          date: formatDate(date),
        });
        if (report) {
          reports.push(report);
        }
      }
      return successResponse(reports);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取日报列表失败');
    }
  }

  async getDashboardOverview(params: {
    accountId: string;
    days?: number;
  }): Promise<
    ApiResponse<{
      summary: {
        totalPlays: number;
        totalLikes: number;
        totalComments: number;
        totalShares: number;
        totalFavorites: number;
        newFollowers: number;
        publishCount: number;
      };
      dailyTrend: {
        date: string;
        playsCount: number;
        newFollowers: number;
      }[];
      topTopics: TopicRanking[];
      recentAlerts: AbnormalFluctuation[];
    }>
  > {
    if (!params.accountId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '账号ID不能为空');
    }

    const days = params.days || 7;
    const { startDate, endDate } = getDateRange(days);

    try {
      const account = await this.adapter.getAccount(params.accountId);
      if (!account) {
        return errorResponse(ErrorCode.ACCOUNT_NOT_BOUND, '账号不存在');
      }
      const [dailyReports, topics, alerts] = await Promise.all([
        this.getRecentDailyReports({ accountId: params.accountId, days }),
        this.adapter.getTopicRanking({
          accountId: params.accountId,
          startDate,
          endDate,
          limit: 5,
        }),
        this.adapter.getAbnormalFluctuations({
          accountId: params.accountId,
          startDate,
          endDate,
        }),
      ]);

      const reports = dailyReports.data || [];
      const summary = reports.reduce(
        (acc, r) => {
          acc.totalPlays += r.summary.totalPlays;
          acc.totalLikes += r.summary.totalLikes;
          acc.totalComments += r.summary.totalComments;
          acc.totalShares += r.summary.totalShares;
          acc.totalFavorites += r.summary.totalFavorites;
          acc.newFollowers += r.summary.newFollowers;
          acc.publishCount += r.summary.publishCount;
          return acc;
        },
        {
          totalPlays: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalFavorites: 0,
          newFollowers: 0,
          publishCount: 0,
        }
      );

      const dailyTrend = reports.map((r) => ({
        date: r.date,
        playsCount: r.summary.totalPlays,
        newFollowers: r.summary.newFollowers,
      }));

      return successResponse({
        summary,
        dailyTrend,
        topTopics: topics,
        recentAlerts: alerts.slice(0, 5),
      });
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取看板概览失败');
    }
  }

  async exportReport(params: {
    accountId: string;
    reportType: 'daily' | 'weekly';
    date?: string;
    weekOffset?: number;
    format: 'json' | 'csv' | 'excel';
  }): Promise<ApiResponse<{ content: string; filename: string; format: string }>> {
    if (!params.accountId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '账号ID不能为空');
    }

    try {
      const account = await this.adapter.getAccount(params.accountId);
      if (!account) {
        return errorResponse(ErrorCode.ACCOUNT_NOT_BOUND, '账号不存在');
      }

      let reportData: any;
      let filename: string;

      if (params.reportType === 'daily') {
        const result = await this.getDailyReport({
          accountId: params.accountId,
          date: params.date,
        });
        if (result.code !== 0 || !result.data) {
          return errorResponse(result.code, result.message);
        }
        reportData = result.data;
        filename = `日报_${params.date || formatDate(new Date())}`;
      } else {
        const result = await this.getWeeklyReport({
          accountId: params.accountId,
          weekOffset: params.weekOffset,
        });
        if (result.code !== 0 || !result.data) {
          return errorResponse(result.code, result.message);
        }
        reportData = result.data;
        filename = `周报_${result.data.weekStart}`;
      }

      let content: string;
      if (params.format === 'json') {
        content = JSON.stringify(reportData, null, 2);
        filename += '.json';
      } else if (params.format === 'csv') {
        content = this.convertToCSV(reportData);
        filename += '.csv';
      } else {
        content = JSON.stringify(reportData, null, 2);
        filename += '.xlsx';
      }

      return successResponse({
        content,
        filename,
        format: params.format,
      });
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '导出报表失败');
    }
  }

  private convertToCSV(data: any): string {
    if (!data) return '';

    const rows: string[] = [];
    const summary = data.summary || data;

    const headers = Object.keys(summary);
    rows.push(headers.join(','));

    const values = headers.map((key) => {
      const val = summary[key];
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`;
      }
      return val;
    });
    rows.push(values.join(','));

    return rows.join('\n');
  }
}
