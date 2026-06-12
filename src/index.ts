import { DataAdapter } from './adapters/adapter';
import { MockDataAdapter } from './adapters/mockAdapter';
import { AccountService } from './services/accountService';
import { VideoService } from './services/videoService';
import { CommentService } from './services/commentService';
import { ReportService } from './services/reportService';

export interface SDKConfig {
  adapter?: DataAdapter;
  adapterType?: 'mock' | 'api';
  apiBaseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

export class ShortVideoAnalyticsSDK {
  private adapter: DataAdapter;
  private config: SDKConfig;

  public account: AccountService;
  public video: VideoService;
  public comment: CommentService;
  public report: ReportService;

  constructor(config: SDKConfig = {}) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    if (config.adapter) {
      this.adapter = config.adapter;
    } else if (config.adapterType === 'mock' || !config.adapterType) {
      this.adapter = new MockDataAdapter();
    } else {
      throw new Error('未指定有效的数据适配器');
    }

    this.account = new AccountService(this.adapter);
    this.video = new VideoService(this.adapter);
    this.comment = new CommentService(this.adapter);
    this.report = new ReportService(this.adapter);
  }

  setAdapter(adapter: DataAdapter): void {
    this.adapter = adapter;
    this.account = new AccountService(this.adapter);
    this.video = new VideoService(this.adapter);
    this.comment = new CommentService(this.adapter);
    this.report = new ReportService(this.adapter);
  }

  getAdapter(): DataAdapter {
    return this.adapter;
  }

  getConfig(): SDKConfig {
    return { ...this.config };
  }

  static createMockSDK(): ShortVideoAnalyticsSDK {
    return new ShortVideoAnalyticsSDK({
      adapterType: 'mock',
    });
  }
}

export default ShortVideoAnalyticsSDK;
