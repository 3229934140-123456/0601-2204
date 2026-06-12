import { ShortVideoAnalyticsSDK } from './index';
import { formatPercent, formatNumber } from './utils/helper';

async function main() {
  console.log('=== 短视频数据分析 SDK 使用示例 ===\n');

  const sdk = ShortVideoAnalyticsSDK.createMockSDK();

  console.log('--- 1. 账号列表 ---');
  const accountList = await sdk.account.getAccountList({ page: 1, pageSize: 5 });
  console.log('账号总数:', accountList.data.total);
  accountList.data.list.forEach((acc) => {
    console.log(`  - ${acc.accountName} (${acc.platform}) | 粉丝: ${formatNumber(acc.followersCount)}`);
  });

  const firstAccountId = accountList.data.list[0].accountId;
  console.log(`\n使用账号: ${accountList.data.list[0].accountName}`);

  console.log('\n--- 2. 账号指标查询（近7天）---');
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 6);

  const formatDate = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const metrics = await sdk.account.getAccountMetrics({
    accountId: firstAccountId,
    startDate: formatDate(sevenDaysAgo),
    endDate: formatDate(today),
  });

  console.log(`共 ${metrics.data.length} 天数据`);
  metrics.data.slice(0, 3).forEach((m) => {
    console.log(`  ${m.date}: 播放${formatNumber(m.playsCount)} | 点赞${formatNumber(m.likesCount)} | 涨粉${formatNumber(m.newFollowersCount)} | 完播率${formatPercent(m.completionRate)}`);
  });

  console.log('\n--- 3. 账号汇总数据 ---');
  const summary = await sdk.account.getAccountSummary({
    accountId: firstAccountId,
    startDate: formatDate(sevenDaysAgo),
    endDate: formatDate(today),
  });
  console.log('总播放量:', formatNumber(summary.data.totalPlays));
  console.log('总点赞数:', formatNumber(summary.data.totalLikes));
  console.log('新增粉丝:', formatNumber(summary.data.totalNewFollowers));
  console.log('平均完播率:', formatPercent(summary.data.avgCompletionRate));

  console.log('\n--- 4. 作品列表 ---');
  const videoList = await sdk.video.getVideoListWithMetrics({
    accountId: firstAccountId,
    page: 1,
    pageSize: 5,
    sortBy: 'publishTime',
    sortOrder: 'desc',
  });
  console.log('作品总数:', videoList.data.total);
  videoList.data.list.forEach((item, index) => {
    const date = new Date(item.detail.publishTime).toLocaleDateString();
    console.log(`  ${index + 1}. ${item.detail.title}`);
    console.log(`     发布: ${date} | 播放: ${formatNumber(item.metrics.playsCount)} | 完播率: ${formatPercent(item.metrics.completionRate)}`);
  });

  const firstWorkId = videoList.data.list[0].detail.workId;
  console.log(`\n分析作品: ${videoList.data.list[0].detail.title}`);

  console.log('\n--- 5. 评论关键词分析 ---');
  const keywords = await sdk.comment.getCommentKeywords({
    workId: firstWorkId,
    keywordLimit: 8,
  });
  keywords.data.forEach((kw) => {
    const sentimentMap: Record<string, string> = {
      positive: '正面',
      negative: '负面',
      neutral: '中性',
    };
    console.log(`  ${kw.keyword}: ${formatNumber(kw.count)}次 (${sentimentMap[kw.sentiment]})`);
  });

  console.log('\n--- 6. 负面提醒 ---');
  const alerts = await sdk.comment.getNegativeAlerts({
    workId: firstWorkId,
  });
  alerts.data.forEach((alert) => {
    const levelMap: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
    };
    console.log(`  [${levelMap[alert.level]}] ${alert.type}: ${alert.count}条`);
    console.log(`    描述: ${alert.description}`);
    console.log(`    建议: ${alert.suggestion}`);
  });

  console.log('\n--- 7. 热门片段标记 ---');
  const hotSegments = await sdk.comment.getHotSegments({
    workId: firstWorkId,
    segmentCount: 3,
  });
  hotSegments.data.forEach((seg, index) => {
    console.log(`  ${index + 1}. ${seg.description}`);
    console.log(`     时间段: ${seg.startTime}s - ${seg.endTime}s | 热度指数: ${seg.heatIndex} | 留存率: ${formatPercent(seg.retentionRate)}`);
  });

  console.log('\n--- 8. 同系列对比 ---');
  const seriesComp = await sdk.comment.getSeriesComparison({
    accountId: firstAccountId,
    sortBy: 'avgPlays',
  });
  seriesComp.data.forEach((series, index) => {
    console.log(`  ${index + 1}. ${series.seriesName}`);
    console.log(`     作品数: ${series.workCount} | 平均播放: ${formatNumber(series.avgPlays)} | 增长率: ${formatPercent(series.growthRate)}`);
  });

  console.log('\n--- 9. 日报数据 ---');
  const dailyReport = await sdk.report.getDailyReport({
    accountId: firstAccountId,
  });
  if (dailyReport.data) {
    console.log('日期:', dailyReport.data.date);
    console.log('播放量:', formatNumber(dailyReport.data.summary.totalPlays));
    console.log('点赞数:', formatNumber(dailyReport.data.summary.totalLikes));
    console.log('新增粉丝:', formatNumber(dailyReport.data.summary.newFollowers));
    console.log('播放量环比:', formatPercent(dailyReport.data.comparison.playsChangeRate));
  }

  console.log('\n--- 10. 周报数据 ---');
  const weeklyReport = await sdk.report.getWeeklyReport({
    accountId: firstAccountId,
    weekOffset: 0,
  });
  if (weeklyReport.data) {
    console.log('周期:', weeklyReport.data.weekStart, '~', weeklyReport.data.weekEnd);
    console.log('总播放量:', formatNumber(weeklyReport.data.summary.totalPlays));
    console.log('总点赞数:', formatNumber(weeklyReport.data.summary.totalLikes));
    console.log('周环比播放:', formatPercent(weeklyReport.data.weekOverWeek.playsChangeRate));
  }

  console.log('\n--- 11. 选题表现排行 ---');
  const topicRanking = await sdk.report.getTopicRanking({
    accountId: firstAccountId,
    startDate: formatDate(sevenDaysAgo),
    endDate: formatDate(today),
    limit: 5,
    sortBy: 'totalPlays',
  });
  topicRanking.data.forEach((topic) => {
    console.log(`  ${topic.ranking}. ${topic.topic}`);
    console.log(`     作品: ${topic.workCount}个 | 总播放: ${formatNumber(topic.totalPlays)} | 平均互动: ${formatPercent(topic.avgInteractRate)}`);
  });

  console.log('\n--- 12. 异常波动提示 ---');
  const fluctuations = await sdk.report.getAbnormalFluctuations({
    accountId: firstAccountId,
    startDate: formatDate(sevenDaysAgo),
    endDate: formatDate(today),
  });
  fluctuations.data.forEach((fluc) => {
    const severityMap: Record<string, string> = {
      low: '低',
      medium: '中',
      high: '高',
    };
    const direction = fluc.direction === 'up' ? '↑' : '↓';
    console.log(`  [${severityMap[fluc.severity]}] ${fluc.metricName} ${direction}${formatPercent(Math.abs(fluc.changeRate))}`);
    console.log(`    日期: ${fluc.date} | 当前值: ${formatNumber(fluc.currentValue)} | 预期: ${formatNumber(fluc.expectedValue)}`);
    console.log(`    可能原因: ${fluc.possibleReasons.join(', ')}`);
  });

  console.log('\n--- 13. 看板概览（整合数据）---');
  const dashboard = await sdk.report.getDashboardOverview({
    accountId: firstAccountId,
    days: 7,
  });
  console.log('7日总播放:', formatNumber(dashboard.data.summary.totalPlays));
  console.log('7日总点赞:', formatNumber(dashboard.data.summary.totalLikes));
  console.log('7日新增粉丝:', formatNumber(dashboard.data.summary.newFollowers));
  console.log('热门选题Top1:', dashboard.data.topTopics[0]?.topic);
  console.log('近期异常数:', dashboard.data.recentAlerts.length);

  console.log('\n=== SDK 功能演示完成 ===');
  console.log('\n统一响应格式示例:');
  console.log('  code: 状态码 (0为成功)');
  console.log('  message: 提示信息');
  console.log('  data: 业务数据');
  console.log('  timestamp: 响应时间戳');
  console.log('  requestId: 请求ID');
}

main().catch(console.error);
