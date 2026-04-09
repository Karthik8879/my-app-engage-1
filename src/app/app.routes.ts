import { Routes } from '@angular/router';
import { FollowToWinComponent } from './screens/follow-to-win/follow-to-win.component';
import { MoreInfoComponent } from './screens/more-info/more-info.component';
import { SelectContestantComponent } from './screens/select-contestant/select-contestant.component';
import { FollowingComponent } from './screens/following/following.component';
import { ErrorStateComponent } from './screens/error-state/error-state.component';
import { forceErrorScreenGuard } from './guards/force-error-screen.guard';

export const routes: Routes = [
  { path: '', component: FollowToWinComponent, canActivate: [forceErrorScreenGuard] },
  { path: 'more-info', component: MoreInfoComponent, canActivate: [forceErrorScreenGuard] },
  {
    path: 'select-contestant',
    component: SelectContestantComponent,
    canActivate: [forceErrorScreenGuard],
  },
  { path: 'following', component: FollowingComponent, canActivate: [forceErrorScreenGuard] },
  { path: 'error', component: ErrorStateComponent },
];
