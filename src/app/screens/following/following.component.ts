import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScreenContainerComponent } from '../../components/screen-container/screen-container.component';
import { HeaderComponent } from '../../components/header/header.component';

export interface FollowingBannerConfig {
  showBanner: boolean;
  title: string;
  subtitle: string;
  logoSrc: string;
  isEliminated: boolean;
  eliminatedName: string;
}

const BANNER_JSON_URL = '/follow-to-win-banner.json';

const BANNER_FALLBACK: FollowingBannerConfig = {
  showBanner: true,
  title: 'The world is yours',
  subtitle: 'This is a non clickable banner',
  logoSrc: '/ScannerIcon.svg',
  isEliminated: false,
  eliminatedName: '',
};

@Component({
  selector: 'app-following',
  standalone: true,
  imports: [ScreenContainerComponent, HeaderComponent],
  templateUrl: './following.component.html',
  styleUrl: './following.component.css',
})
export class FollowingComponent implements OnInit, OnDestroy {
  readonly banner = signal<FollowingBannerConfig>(BANNER_FALLBACK);
  readonly contestantName = signal('');
  readonly contestantImage = signal('');
  readonly showToast = signal(true);
  readonly isEliminated = signal(false);
  readonly eliminatedName = signal('');
  readonly eliminatedDisplayName = computed(
    () => this.eliminatedName().trim() || this.contestantName(),
  );

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.contestantName.set(params['name'] ?? '');
    this.contestantImage.set(params['image'] ?? '');

    this.toastTimer = setTimeout(() => this.showToast.set(false), 3000);

    void fetch(BANNER_JSON_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('banner'))))
      .then((data: Partial<FollowingBannerConfig>) => {
        const eliminated = data.isEliminated ?? BANNER_FALLBACK.isEliminated;
        const eName = data.eliminatedName ?? BANNER_FALLBACK.eliminatedName;
        this.isEliminated.set(eliminated);
        this.eliminatedName.set(eName);
        this.banner.set({
          showBanner: data.showBanner ?? BANNER_FALLBACK.showBanner,
          title: data.title ?? BANNER_FALLBACK.title,
          subtitle: data.subtitle ?? BANNER_FALLBACK.subtitle,
          logoSrc: data.logoSrc ?? BANNER_FALLBACK.logoSrc,
          isEliminated: eliminated,
          eliminatedName: eName,
        });
      })
      .catch(() => {
        this.banner.set(BANNER_FALLBACK);
      });
  }

  ngOnDestroy(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  onChange(): void {
    this.router.navigate(['/select-contestant']);
  }
}
