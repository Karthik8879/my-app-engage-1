import { Injectable } from '@angular/core';
import {
  FOLLOW_FLOW_FALLBACK,
  FollowFlowConfig,
  mergeFollowFlowConfig,
} from '../models/follow-flow-config';

const BANNER_JSON_URL = '/follow-to-win-banner.json';

@Injectable({ providedIn: 'root' })
export class FollowFlowConfigService {
  private cache: FollowFlowConfig | null = null;
  private inflight: Promise<FollowFlowConfig> | null = null;

  load(): Promise<FollowFlowConfig> {
    if (this.cache) {
      return Promise.resolve(this.cache);
    }
    if (this.inflight) {
      return this.inflight;
    }
    this.inflight = fetch(BANNER_JSON_URL, { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('config'))))
      .then((data: Partial<FollowFlowConfig>) => {
        const merged = mergeFollowFlowConfig(data);
        this.cache = merged;
        return merged;
      })
      .catch(() => {
        const merged = mergeFollowFlowConfig({});
        this.cache = merged;
        return merged;
      })
      .finally(() => {
        this.inflight = null;
      });
    return this.inflight;
  }

  clearCache(): void {
    this.cache = null;
  }
}
