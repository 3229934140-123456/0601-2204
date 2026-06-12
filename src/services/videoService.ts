import { DataAdapter } from '../adapters/adapter';
import { ApiResponse, PaginationResult } from '../types/common';
import { VideoWork, VideoMetrics, VideoListParams } from '../types/video';
import { successResponse, errorResponse, ErrorCode } from '../utils/response';

export class VideoService {
  private adapter: DataAdapter;

  constructor(adapter: DataAdapter) {
    this.adapter = adapter;
  }

  async getVideoList(
    params: VideoListParams = {}
  ): Promise<ApiResponse<PaginationResult<VideoWork>>> {
    try {
      const result = await this.adapter.getVideoList(params);
      return successResponse(result);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取作品列表失败');
    }
  }

  async getVideoDetail(workId: string): Promise<ApiResponse<VideoWork | null>> {
    if (!workId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '作品ID不能为空');
    }

    try {
      const video = await this.adapter.getVideoDetail(workId);
      if (!video) {
        return errorResponse(ErrorCode.WORK_NOT_FOUND, '作品不存在');
      }
      return successResponse(video);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取作品详情失败');
    }
  }

  async getVideoMetrics(workId: string): Promise<ApiResponse<VideoMetrics | null>> {
    if (!workId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '作品ID不能为空');
    }

    try {
      const metrics = await this.adapter.getVideoMetrics(workId);
      if (!metrics) {
        return errorResponse(ErrorCode.WORK_NOT_FOUND, '作品不存在');
      }
      return successResponse(metrics);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取作品指标失败');
    }
  }

  async getVideoDetailWithMetrics(
    workId: string
  ): Promise<
    ApiResponse<{
      detail: VideoWork;
      metrics: VideoMetrics;
    } | null>
  > {
    if (!workId) {
      return errorResponse(ErrorCode.PARAM_ERROR, '作品ID不能为空');
    }

    try {
      const [detail, metrics] = await Promise.all([
        this.adapter.getVideoDetail(workId),
        this.adapter.getVideoMetrics(workId),
      ]);

      if (!detail) {
        return errorResponse(ErrorCode.WORK_NOT_FOUND, '作品不存在');
      }

      return successResponse({
        detail,
        metrics: metrics!,
      });
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取作品详情失败');
    }
  }

  async getVideoListWithMetrics(
    params: VideoListParams = {}
  ): Promise<
    ApiResponse<
      PaginationResult<{
        detail: VideoWork;
        metrics: VideoMetrics;
      }>
    >
  > {
    try {
      const listResult = await this.adapter.getVideoList(params);

      const itemsWithMetrics = await Promise.all(
        listResult.list.map(async (video) => {
          const metrics = await this.adapter.getVideoMetrics(video.workId);
          return {
            detail: video,
            metrics: metrics!,
          };
        })
      );

      return successResponse({
        ...listResult,
        list: itemsWithMetrics,
      });
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取作品列表失败');
    }
  }

  async getVideoCount(
    params: Omit<VideoListParams, 'page' | 'pageSize'> = {}
  ): Promise<ApiResponse<number>> {
    try {
      const result = await this.adapter.getVideoList({
        ...params,
        page: 1,
        pageSize: 1,
      });
      return successResponse(result.total);
    } catch (error) {
      return errorResponse(ErrorCode.INTERNAL_ERROR, '获取作品数量失败');
    }
  }
}
