import { Routes } from '@angular/router';
import { FollowToWinComponent } from './screens/follow-to-win/follow-to-win.component';
import { MoreInfoComponent } from './screens/more-info/more-info.component';
import { SelectContestantComponent } from './screens/select-contestant/select-contestant.component';

export const routes: Routes = [
  { path: '', component: FollowToWinComponent },
  { path: 'more-info', component: MoreInfoComponent },
  { path: 'select-contestant', component: SelectContestantComponent },
];
