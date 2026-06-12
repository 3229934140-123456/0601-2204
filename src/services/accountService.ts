import { DataAdapter } from '../adapters/adapter';
import { ApiResponse, PaginationResult } from '../types/common';
import {
  Account,
  AccountMetrics,
  BindAccountParams,
  AccountListParams,
  AccountMetricsParams,
} from '../types/account';
import { successResponse, errorResponse, ErrorCode } from '../utils/response';
import { validateDateRange } from '../utils/helper';

export class AccountService {
  private adapter: DataAdapter;

  constructor(adapter: DataAdapter) {
    this.adapter = adapter;
  }

  async bindAccount(params: BindAccountParams): Promise<ApiResponse<Account>> {
    if (!params.platform) {
      return errorResponse(ErrorCode.PARAM_ERROR, '平台类型不能为空');
    }
    if (!params.authCode) {
      return errorResponse(ErrorCode.PARAM_ERROR, '授权码不能为空');
    }

    try {
      const account = await this.adapter.bindAccount(params);
      return successResponse(account, '账号绑定成功');
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '账号绑定失败');
    }
  }

  async unbindAccount(accountId: string): Promise<ApiResponse<boolean>> {
    if (!accountId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '账号ID不能为空');
    }

    try {
      const result = await this.adapter.unbindAccount(accountId);
      if (!result) {
        return errorResponse(ErrorCode.ACCOUNT_NOT_BOUND, '账号不存在或已解绑');
      }
      return successResponse(true, '账号解绑成功');
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '账号解绑失败');
    }
  }

  async getAccount(accountId: string): Promise<ApiResponse<Account | null>> {
    if (!accountId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '账号ID不能为空');
    }

    try {
      const account = await this.adapter.getAccount(accountId);
      if (!account) {
        return errorResponse(ErrorCode.ACCOUNT_NOT_BOUND, '账号不存在');
      }
      return successResponse(account);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取账号信息失败');
    }
  }

  async getAccountList(
    params: AccountListParams = {}
  ): Promise<ApiResponse<PaginationResult<Account>>> {
    try {
      const result = await this.adapter.getAccountList(params);
      return successResponse(result);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取账号列表失败');
    }
  }

  async getAccountMetrics(
    params: AccountMetricsParams
  ): Promise<ApiResponse<AccountMetrics[]>> {
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
      const metrics = await this.adapter.getAccountMetrics(params);
      return successResponse(metrics);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取账号指标失败');
    }
  }

  async getAccountSummary(
    params: AccountMetricsParams
  ): Promise<ApiResponse<{
    totalPlays: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalFavorites: number;
    totalNewFollowers: number;
    avgCompletionRate: number;
    dateRange: { startDate: string; endDate: string };
  }>> {
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
      const metrics = await this.adapter.getAccountMetrics(params);
      if (metrics.length === 0) {
        return successResponse({
          totalPlays: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalFavorites: 0,
          totalNewFollowers: 0,
          avgCompletionRate: 0,
          dateRange: { startDate: params.startDate, endDate: params.endDate },
        });
      }

      const summary = metrics.reduce(
        (acc, m) => {
          acc.totalPlays += m.playsCount;
          acc.totalLikes += m.likesCount;
          acc.totalComments += m.commentsCount;
          acc.totalShares += m.sharesCount;
          acc.totalFavorites += m.favoritesCount;
          acc.totalNewFollowers += m.newFollowersCount;
          acc.completionRateSum += m.completionRate;
          return acc;
        },
        {
          totalPlays: 0,
          totalLikes: 0,
          totalComments: 0,
          totalShares: 0,
          totalFavorites: 0,
          totalNewFollowers: 0,
          completionRateSum: 0,
        }
      );

      return successResponse({
        totalPlays: summary.totalPlays,
        totalLikes: summary.totalLikes,
        totalComments: summary.totalComments,
        totalShares: summary.totalShares,
        totalFavorites: summary.totalFavorites,
        totalNewFollowers: summary.totalNewFollowers,
        avgCompletionRate: summary.completionRateSum / metrics.length,
        dateRange: { startDate: params.startDate, endDate: params.endDate },
      });
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取账号汇总数据失败');
    }
  }
}
