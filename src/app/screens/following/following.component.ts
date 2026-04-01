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
  selectionWindowClosed: boolean;
  isFollowing: boolean;
  openWindowDescription: string;
  closedWindowShortDescription: string;
  closedWindowFollowingDescription: string;
  eliminatedClosedSubcaption: string;
}

const BANNER_JSON_URL = '/follow-to-win-banner.json';

const BANNER_FALLBACK: FollowingBannerConfig = {
  showBanner: true,
  title: 'The world is yours',
  subtitle: 'This is a non clickable banner',
  logoSrc: '/ScannerIcon.svg',
  isEliminated: false,
  eliminatedName: '',
  selectionWindowClosed: false,
  isFollowing: false,
  openWindowDescription:
    'Tap on your favorite contestant to follow them and stand a chance to win big',
  closedWindowShortDescription: 'Selection window is closed.',
  closedWindowFollowingDescription:
    "The selection window is closed. You've chosen a contestant to follow until the end.",
  eliminatedClosedSubcaption: 'You can no longer follow this contestant.',
};

function mergeFollowingConfig(data: Partial<FollowingBannerConfig>): FollowingBannerConfig {
  return {
    showBanner: data.showBanner ?? BANNER_FALLBACK.showBanner,
    title: data.title ?? BANNER_FALLBACK.title,
    subtitle: data.subtitle ?? BANNER_FALLBACK.subtitle,
    logoSrc: data.logoSrc ?? BANNER_FALLBACK.logoSrc,
    isEliminated: data.isEliminated ?? BANNER_FALLBACK.isEliminated,
    eliminatedName: data.eliminatedName ?? BANNER_FALLBACK.eliminatedName,
    selectionWindowClosed: data.selectionWindowClosed ?? BANNER_FALLBACK.selectionWindowClosed,
    isFollowing: data.isFollowing ?? BANNER_FALLBACK.isFollowing,
    openWindowDescription:
      data.openWindowDescription ?? BANNER_FALLBACK.openWindowDescription,
    closedWindowShortDescription:
      data.closedWindowShortDescription ?? BANNER_FALLBACK.closedWindowShortDescription,
    closedWindowFollowingDescription:
      data.closedWindowFollowingDescription ??
      BANNER_FALLBACK.closedWindowFollowingDescription,
    eliminatedClosedSubcaption:
      data.eliminatedClosedSubcaption ?? BANNER_FALLBACK.eliminatedClosedSubcaption,
  };
}

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

  readonly eliminatedDisplayName = computed(
    () => this.banner().eliminatedName.trim() || this.contestantName(),
  );

  readonly showClosedBadge = computed(() => {
    const b = this.banner();
    return b.selectionWindowClosed && (!b.isFollowing || b.isEliminated);
  });

  readonly heroDescription = computed(() => {
    const b = this.banner();
    if (!b.selectionWindowClosed) {
      return b.openWindowDescription;
    }
    if (!b.isFollowing) {
      return b.closedWindowShortDescription;
    }
    if (b.isEliminated) {
      return b.closedWindowShortDescription;
    }
    return b.closedWindowFollowingDescription;
  });

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
        this.banner.set(mergeFollowingConfig(data));
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
