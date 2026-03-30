import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ScreenContainerComponent } from '../../components/screen-container/screen-container.component';
import { HeaderComponent } from '../../components/header/header.component';
import { CallToActionButtonComponent } from '../../components/call-to-action-button/call-to-action-button.component';

export interface FollowToWinBannerConfig {
  showBanner: boolean;
  title: string;
  subtitle: string;
  logoSrc: string;
}

const BANNER_JSON_URL = '/follow-to-win-banner.json';

const BANNER_FALLBACK: FollowToWinBannerConfig = {
  showBanner: true,
  title: 'The world is yours',
  subtitle: 'This is a non clickable banner',
  logoSrc: '/ScannerIcon.svg',
};

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
export class FollowToWinComponent implements OnInit {
  readonly banner = signal<FollowToWinBannerConfig>(BANNER_FALLBACK);

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    void fetch(BANNER_JSON_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('banner config'))))
      .then((data: Partial<FollowToWinBannerConfig>) => {
        this.banner.set({
          showBanner: data.showBanner ?? BANNER_FALLBACK.showBanner,
          title: data.title ?? BANNER_FALLBACK.title,
          subtitle: data.subtitle ?? BANNER_FALLBACK.subtitle,
          logoSrc: data.logoSrc ?? BANNER_FALLBACK.logoSrc,
        });
      })
      .catch(() => {
        this.banner.set(BANNER_FALLBACK);
      });
  }

  onFollowContestant(): void {
    this.router.navigate(['/select-contestant']);
  }
}
