import { DataAdapter } from './adapter';
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
import { PaginationResult, Platform } from '../types/common';
import { paginate, formatDate, getDateRange, getWeekRange, generateId } from '../utils/helper';

export class MockDataAdapter implements DataAdapter {
  private accounts: Map<string, Account> = new Map();
  private videos: Map<string, VideoWork> = new Map();

  constructor() {
    this.initMockData();
  }

  private initMockData(): void {
    const platforms: Platform[] = ['douyin', 'kuaishou', 'xiaohongshu'];
    const accountNames = ['美食探店达人', '科技数码君', '旅行日记', '健身教练小李', '萌宠日常'];

    for (let i = 0; i < 5; i++) {
      const accountId = `acc_${i + 1}`;
      const platform = platforms[i % platforms.length];
      const account: Account = {
        accountId,
        platform,
        accountName: accountNames[i],
        avatarUrl: `https://example.com/avatar/${accountId}.jpg`,
        followersCount: Math.floor(Math.random() * 5000000) + 100000,
        followingCount: Math.floor(Math.random() * 500) + 50,
        totalWorksCount: Math.floor(Math.random() * 500) + 50,
        totalLikesCount: Math.floor(Math.random() * 50000000) + 1000000,
        totalPlaysCount: Math.floor(Math.random() * 500000000) + 10000000,
        bio: `${accountNames[i]}的官方账号，分享精彩内容`,
        isVerified: i < 3,
        bindTime: Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        status: 'active',
      };
      this.accounts.set(accountId, account);

      const seriesNames = ['系列A', '系列B', '系列C'];
      for (let j = 0; j < 20; j++) {
        const workId = `work_${i}_${j}`;
        const seriesIndex = j % 3;
        const publishTime = Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000;
        const video: VideoWork = {
          workId,
          accountId,
          platform,
          title: `${accountNames[i]}的第${j + 1}个精彩视频`,
          description: `这是一个关于${seriesNames[seriesIndex]}的视频内容，欢迎点赞收藏关注~`,
          coverUrl: `https://example.com/cover/${workId}.jpg`,
          videoUrl: `https://example.com/video/${workId}.mp4`,
          duration: Math.floor(Math.random() * 180) + 15,
          publishTime,
          tags: [seriesNames[seriesIndex], '热门', '推荐'],
          seriesId: `series_${i}_${seriesIndex}`,
          seriesName: seriesNames[seriesIndex],
          status: 'published',
        };
        this.videos.set(workId, video);
      }
    }
  }

  async bindAccount(params: BindAccountParams): Promise<Account> {
    const accountId = generateId('acc');
    const account: Account = {
      accountId,
      platform: params.platform,
      accountName: '新绑定账号',
      avatarUrl: `https://example.com/avatar/${accountId}.jpg`,
      followersCount: 0,
      followingCount: 0,
      totalWorksCount: 0,
      totalLikesCount: 0,
      totalPlaysCount: 0,
      bio: '',
      isVerified: false,
      bindTime: Date.now(),
      status: 'active',
    };
    this.accounts.set(accountId, account);
    return account;
  }

  async unbindAccount(accountId: string): Promise<boolean> {
    return this.accounts.delete(accountId);
  }

  async getAccount(accountId: string): Promise<Account | null> {
    return this.accounts.get(accountId) || null;
  }

  async getAccountList(params: AccountListParams): Promise<PaginationResult<Account>> {
    let list = Array.from(this.accounts.values());
    if (params.platform) {
      list = list.filter((a) => a.platform === params.platform);
    }
    if (params.status) {
      list = list.filter((a) => a.status === params.status);
    }
    return paginate(list, { page: params.page, pageSize: params.pageSize });
  }

  async getAccountMetrics(params: AccountMetricsParams): Promise<AccountMetrics[]> {
    const { startDate, endDate, accountId } = params;
    const metrics: AccountMetrics[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    const account = this.accounts.get(accountId);
    let baseFollowers = account?.followersCount || 100000;

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = formatDate(d);
      const playsCount = Math.floor(Math.random() * 500000) + 50000;
      const likesCount = Math.floor(playsCount * (Math.random() * 0.05 + 0.02));
      const commentsCount = Math.floor(likesCount * (Math.random() * 0.1 + 0.05));
      const sharesCount = Math.floor(likesCount * (Math.random() * 0.2 + 0.05));
      const favoritesCount = Math.floor(likesCount * (Math.random() * 0.3 + 0.1));
      const newFollowersCount = Math.floor(Math.random() * 2000) + 100;

      baseFollowers += newFollowersCount;

      metrics.push({
        accountId,
        date: dateStr,
        playsCount,
        likesCount,
        commentsCount,
        sharesCount,
        favoritesCount,
        newFollowersCount,
        totalFollowersCount: baseFollowers,
        completionRate: Math.random() * 0.3 + 0.4,
        avgWatchDuration: Math.floor(Math.random() * 30) + 10,
        publishCount: Math.random() > 0.6 ? 1 : 0,
      });
    }

    return metrics;
  }

  async getVideoList(params: VideoListParams): Promise<PaginationResult<VideoWork>> {
    let list = Array.from(this.videos.values());

    if (params.accountId) {
      list = list.filter((v) => v.accountId === params.accountId);
    }
    if (params.seriesId) {
      list = list.filter((v) => v.seriesId === params.seriesId);
    }
    if (params.status) {
      list = list.filter((v) => v.status === params.status);
    }
    if (params.keyword) {
      list = list.filter(
        (v) => v.title.includes(params.keyword!) || v.description.includes(params.keyword!)
      );
    }
    if (params.startDate) {
      const startTime = new Date(params.startDate).getTime();
      list = list.filter((v) => v.publishTime >= startTime);
    }
    if (params.endDate) {
      const endTime = new Date(params.endDate).getTime() + 24 * 60 * 60 * 1000;
      list = list.filter((v) => v.publishTime < endTime);
    }

    const sortBy = params.sortBy || 'publishTime';
    const sortOrder = params.sortOrder || 'desc';
    list.sort((a, b) => {
      let valA: any = (a as any)[sortBy];
      let valB: any = (b as any)[sortBy];
      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (sortOrder === 'asc') {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });

    return paginate(list, { page: params.page, pageSize: params.pageSize });
  }

  async getVideoDetail(workId: string): Promise<VideoWork | null> {
    return this.videos.get(workId) || null;
  }

  async getVideoMetrics(workId: string): Promise<VideoMetrics | null> {
    if (!this.videos.has(workId)) return null;

    const playsCount = Math.floor(Math.random() * 500000) + 10000;
    const likesCount = Math.floor(playsCount * (Math.random() * 0.05 + 0.03));
    const commentsCount = Math.floor(likesCount * (Math.random() * 0.1 + 0.05));
    const sharesCount = Math.floor(likesCount * (Math.random() * 0.2 + 0.05));
    const favoritesCount = Math.floor(likesCount * (Math.random() * 0.3 + 0.1));

    return {
      workId,
      playsCount,
      likesCount,
      commentsCount,
      sharesCount,
      favoritesCount,
      completionRate: Math.random() * 0.3 + 0.4,
      avgWatchDuration: Math.floor(Math.random() * 30) + 10,
      playDuration: Math.floor(playsCount * 15),
      newFollowersCount: Math.floor(Math.random() * 500) + 10,
      collectRate: favoritesCount / playsCount,
      interactRate: (likesCount + commentsCount + sharesCount) / playsCount,
    };
  }

  async getCommentKeywords(params: CommentSummaryParams): Promise<CommentKeyword[]> {
    const keywords: string[] = [
      '好看', '精彩', '喜欢', '支持', '加油', '太棒了',
      '垃圾', '不好看', '抄袭', '广告太多', '质量下降',
      '学到了', '有用', '干货', '收藏', '下期预告',
    ];

    const sentiments: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'negative', 'neutral'];
    const trends: Array<'up' | 'down' | 'stable'> = ['up', 'down', 'stable'];

    const limit = params.keywordLimit || 10;
    const result: CommentKeyword[] = [];

    for (let i = 0; i < limit; i++) {
      result.push({
        keyword: keywords[i % keywords.length],
        count: Math.floor(Math.random() * 5000) + 100,
        sentiment: sentiments[i % 3],
        trend: trends[i % 3],
      });
    }

    return result.sort((a, b) => b.count - a.count);
  }

  async getNegativeAlerts(params: CommentSummaryParams): Promise<NegativeAlert[]> {
    const alerts: NegativeAlert[] = [
      {
        type: '负面评论激增',
        level: 'high',
        count: 156,
        description: '近24小时负面评论数量较前日增长120%',
        exampleComments: ['这个视频质量不行啊', '越来越水了', '取关了'],
        suggestion: '建议关注内容质量，及时回应用户关切',
      },
      {
        type: '广告争议',
        level: 'medium',
        count: 78,
        description: '评论中出现较多关于广告植入的讨论',
        exampleComments: ['广告太硬了', '又是恰饭视频'],
        suggestion: '建议优化广告植入方式，保持内容自然',
      },
      {
        type: '抄袭质疑',
        level: 'high',
        count: 45,
        description: '有用户质疑内容原创性',
        exampleComments: ['这不是抄的XX吗', '原创还是搬运？'],
        suggestion: '建议准备原创证明，必要时发布声明',
      },
    ];

    if (params.alertLevel) {
      return alerts.filter((a) => a.level === params.alertLevel);
    }

    return alerts;
  }

  async getHotSegments(params: HotSegmentsParams): Promise<HotSegment[]> {
    const count = params.segmentCount || 5;
    const segments: HotSegment[] = [];

    for (let i = 0; i < count; i++) {
      const startTime = i * 20;
      segments.push({
        segmentId: `seg_${i}`,
        startTime,
        endTime: startTime + 20,
        description: `第${i + 1}个高潮片段`,
        heatIndex: Math.floor(Math.random() * 100) + 50,
        retentionRate: Math.random() * 0.3 + 0.6,
        commentCount: Math.floor(Math.random() * 200) + 20,
      });
    }

    return segments.sort((a, b) => b.heatIndex - a.heatIndex);
  }

  async getSeriesComparison(params: SeriesComparisonParams): Promise<SeriesComparison[]> {
    const seriesList: SeriesComparison[] = [];
    const seriesNames = ['系列A', '系列B', '系列C', '系列D'];

    for (let i = 0; i < seriesNames.length; i++) {
      const workCount = Math.floor(Math.random() * 20) + 5;
      const avgPlays = Math.floor(Math.random() * 300000) + 50000;
      seriesList.push({
        seriesId: `series_${i}`,
        seriesName: seriesNames[i],
        workCount,
        avgPlays,
        avgLikes: Math.floor(avgPlays * 0.04),
        avgCompletionRate: Math.random() * 0.2 + 0.45,
        avgInteractRate: Math.random() * 0.05 + 0.03,
        growthRate: Math.random() * 0.5 - 0.2,
      });
    }

    const sortBy = params.sortBy || 'avgPlays';
    return seriesList.sort((a, b) => {
      const valA = (a as any)[sortBy];
      const valB = (b as any)[sortBy];
      return valB - valA;
    });
  }

  async getDailyReport(params: ReportParams): Promise<DailyReport | null> {
    const date = params.date || formatDate(new Date());
    const accountId = params.accountId;

    const topWorks = await this.getTopWorks(accountId, 5);
    const hourlyDistribution = this.generateHourlyData();

    const totalPlays = topWorks.reduce((sum, w) => sum + w.playsCount, 0) + Math.floor(Math.random() * 100000);
    const totalLikes = topWorks.reduce((sum, w) => sum + w.likesCount, 0) + Math.floor(Math.random() * 10000);

    return {
      date,
      accountId,
      summary: {
        totalPlays,
        totalLikes,
        totalComments: Math.floor(totalLikes * 0.08),
        totalShares: Math.floor(totalLikes * 0.1),
        totalFavorites: Math.floor(totalLikes * 0.2),
        newFollowers: Math.floor(Math.random() * 2000) + 200,
        publishCount: Math.floor(Math.random() * 3) + 1,
        avgCompletionRate: Math.random() * 0.2 + 0.5,
      },
      topWorks,
      hourlyDistribution,
      comparison: {
        playsChangeRate: Math.random() * 0.4 - 0.15,
        likesChangeRate: Math.random() * 0.4 - 0.15,
        commentsChangeRate: Math.random() * 0.4 - 0.15,
        followersChangeRate: Math.random() * 0.3 - 0.1,
      },
    };
  }

  async getWeeklyReport(params: ReportParams): Promise<WeeklyReport | null> {
    const accountId = params.accountId;
    const { startDate: weekStart, endDate: weekEnd } = getWeekRange(params.weekOffset || 0);

    const dailyTrend: DailyTrendItem[] = [];
    let totalPlays = 0;
    let totalLikes = 0;

    const start = new Date(weekStart);
    const end = new Date(weekEnd);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const plays = Math.floor(Math.random() * 500000) + 100000;
      const likes = Math.floor(plays * 0.04);
      totalPlays += plays;
      totalLikes += likes;
      dailyTrend.push({
        date: formatDate(d),
        playsCount: plays,
        likesCount: likes,
        newFollowers: Math.floor(Math.random() * 2000) + 100,
      });
    }

    const topWorks = await this.getTopWorks(accountId, 10);

    return {
      weekStart,
      weekEnd,
      accountId,
      summary: {
        totalPlays,
        totalLikes,
        totalComments: Math.floor(totalLikes * 0.08),
        totalShares: Math.floor(totalLikes * 0.1),
        totalFavorites: Math.floor(totalLikes * 0.2),
        newFollowers: Math.floor(Math.random() * 10000) + 1000,
        publishCount: Math.floor(Math.random() * 10) + 5,
        avgCompletionRate: Math.random() * 0.2 + 0.5,
      },
      dailyTrend,
      topWorks,
      weekOverWeek: {
        playsChangeRate: Math.random() * 0.4 - 0.15,
        likesChangeRate: Math.random() * 0.4 - 0.15,
        commentsChangeRate: Math.random() * 0.4 - 0.15,
        followersChangeRate: Math.random() * 0.3 - 0.1,
        publishChangeRate: Math.random() * 0.5 - 0.2,
      },
    };
  }

  private async getTopWorks(accountId: string, limit: number): Promise<TopWorkItem[]> {
    const videos = Array.from(this.videos.values()).filter((v) => v.accountId === accountId);
    const topWorks: TopWorkItem[] = videos.slice(0, limit).map((v) => ({
      workId: v.workId,
      title: v.title,
      coverUrl: v.coverUrl,
      playsCount: Math.floor(Math.random() * 500000) + 10000,
      likesCount: Math.floor(Math.random() * 20000) + 500,
      completionRate: Math.random() * 0.3 + 0.4,
    }));
    return topWorks.sort((a, b) => b.playsCount - a.playsCount);
  }

  private generateHourlyData(): HourlyData[] {
    const data: HourlyData[] = [];
    for (let h = 0; h < 24; h++) {
      const basePlays = h >= 8 && h <= 23 ? 20000 : 5000;
      data.push({
        hour: h,
        playsCount: Math.floor(Math.random() * basePlays) + basePlays / 2,
        likesCount: Math.floor(Math.random() * basePlays * 0.04) + basePlays * 0.02,
      });
    }
    return data;
  }

  async getTopicRanking(params: TopicRankingParams): Promise<TopicRanking[]> {
    const topics = [
      '美食教程', '旅行vlog', '健身打卡', '数码测评', '美妆分享',
      '搞笑段子', '知识科普', '生活技巧', '职场经验', '情感故事',
    ];

    const rankings: TopicRanking[] = topics.map((topic, index) => {
      const workCount = Math.floor(Math.random() * 30) + 5;
      const totalPlays = Math.floor(Math.random() * 5000000) + 100000;
      return {
        topic,
        workCount,
        totalPlays,
        avgPlays: Math.floor(totalPlays / workCount),
        totalLikes: Math.floor(totalPlays * 0.04),
        avgInteractRate: Math.random() * 0.05 + 0.02,
        trend: (['up', 'down', 'stable'] as const)[index % 3],
        ranking: index + 1,
      };
    });

    const sortBy = params.sortBy || 'totalPlays';
    const sorted = rankings.sort((a, b) => (b as any)[sortBy] - (a as any)[sortBy]);
    sorted.forEach((item, index) => {
      item.ranking = index + 1;
    });

    const limit = params.limit || 10;
    return sorted.slice(0, limit);
  }

  async getAbnormalFluctuations(params: AbnormalFluctuationParams): Promise<AbnormalFluctuation[]> {
    const fluctuations: AbnormalFluctuation[] = [
      {
        id: 'abn_1',
        type: 'plays',
        metricName: '播放量',
        date: formatDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
        currentValue: 1500000,
        expectedValue: 500000,
        changeRate: 2.0,
        direction: 'up',
        severity: 'high',
        possibleReasons: ['登上平台热门推荐', '被大V转发', '话题热度上升'],
        suggestions: ['抓住热度发布同类型内容', '及时回复评论提升互动', '引导用户关注账号'],
        relatedWorks: ['work_1_5', 'work_1_8'],
      },
      {
        id: 'abn_2',
        type: 'followers',
        metricName: '粉丝数',
        date: formatDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
        currentValue: 5000,
        expectedValue: 2000,
        changeRate: 1.5,
        direction: 'up',
        severity: 'medium',
        possibleReasons: ['爆款视频带来涨粉', '粉丝活动效果好', '平台推荐位曝光'],
        suggestions: ['发布粉丝福利巩固新粉', '优化主页引导关注'],
        relatedWorks: ['work_1_5'],
      },
      {
        id: 'abn_3',
        type: 'likes',
        metricName: '点赞数',
        date: formatDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
        currentValue: 8000,
        expectedValue: 20000,
        changeRate: -0.6,
        direction: 'down',
        severity: 'high',
        possibleReasons: ['内容质量下滑', '发布时间不佳', '竞争内容分流'],
        suggestions: ['分析同期热门内容', '优化选题方向', '调整发布时间'],
        relatedWorks: ['work_1_12'],
      },
    ];

    if (params.severity) {
      return fluctuations.filter((f) => f.severity === params.severity);
    }

    if (params.metricTypes && params.metricTypes.length > 0) {
      return fluctuations.filter((f) => params.metricTypes!.includes(f.type));
    }

    return fluctuations;
  }
}

interface TopWorkItem {
  workId: string;
  title: string;
  coverUrl: string;
  playsCount: number;
  likesCount: number;
  completionRate: number;
}

interface HourlyData {
  hour: number;
  playsCount: number;
  likesCount: number;
}

interface DailyTrendItem {
  date: string;
  playsCount: number;
  likesCount: number;
  newFollowers: number;
}
