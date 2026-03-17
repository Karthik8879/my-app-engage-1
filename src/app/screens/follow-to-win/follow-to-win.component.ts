import { Component } from '@angular/core';
import { ScreenContainerComponent } from '../../components/screen-container/screen-container.component';
import { HeaderComponent } from '../../components/header/header.component';
import { CallToActionButtonComponent } from '../../components/call-to-action-button/call-to-action-button.component';

@Component({
  selector: 'app-follow-to-win',
  standalone: true,
  imports: [
    ScreenContainerComponent,
    HeaderComponent,
    CallToActionButtonComponent,
  ],
  templateUrl: './follow-to-win.component.html',
  styleUrl: './follow-to-win.component.css',
})
export class FollowToWinComponent {
  onFollowContestant(): void {
    // Stub for follow contestant action
  }
}
