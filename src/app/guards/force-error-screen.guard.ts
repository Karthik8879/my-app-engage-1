import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { FollowFlowConfigService } from '../services/follow-flow-config.service';

export const forceErrorScreenGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const config = inject(FollowFlowConfigService);
  const router = inject(Router);
  const c = await config.load();
  if (!c.forceErrorScreen) {
    return true;
  }
  return router.createUrlTree(['/error'], { queryParams: { type: c.forceErrorScreenKind } });
};
