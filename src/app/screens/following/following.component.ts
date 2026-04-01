import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScreenContainerComponent } from '../../components/screen-container/screen-container.component';
import { HeaderComponent } from '../../components/header/header.component';
import { FollowFlowConfigService } from '../../services/follow-flow-config.service';
import {
  FOLLOW_FLOW_FALLBACK,
  FollowFlowConfig,
  formatSelectionCountdown,
  getRemainingSeconds,
} from '../../models/follow-flow-config';

@Component({
  selector: 'app-following',
  standalone: true,
  imports: [ScreenContainerComponent, HeaderComponent],
  templateUrl: './following.component.html',
  styleUrl: './following.component.css',
})
export class FollowingComponent implements OnInit, OnDestroy {
  readonly banner = signal<FollowFlowConfig>(FOLLOW_FLOW_FALLBACK);

  readonly contestantName = signal('');
  readonly contestantImage = signal('');
  readonly showToast = signal(false);

  readonly tick = signal(0);

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

  readonly showTimerPill = computed(() => {
    const b = this.banner();
    const ts = b.timerStatus;
    return ts.showTimerPill && !b.selectionWindowClosed && ts.timerMode !== 'none';
  });

  readonly timerPillPrefix = computed(() => {
    const m = this.banner().timerStatus.timerMode;
    if (m === 'closesOn') {
      return 'CLOSES ON:';
    }
    if (m === 'closesIn') {
      return 'CLOSES IN:';
    }
    return '';
  });

  readonly timerPillValue = computed(() => {
    this.tick();
    const ts = this.banner().timerStatus;
    if (ts.timerMode === 'closesOn') {
      return ts.closesOnLabel;
    }
    if (ts.timerMode === 'closesIn') {
      const override = ts.timerDisplayOverride.trim();
      if (override) {
        return override;
      }
      if (!ts.selectionClosesAt.trim()) {
        return '—';
      }
      const sec = getRemainingSeconds(ts.selectionClosesAt);
      return formatSelectionCountdown(sec);
    }
    return '';
  });

  readonly timerValueTone = computed((): 'default' | 'gold' | 'urgent' => {
    this.tick();
    const ts = this.banner().timerStatus;
    if (ts.isUrgent) {
      return 'urgent';
    }
    if (
      ts.timerMode === 'closesIn' &&
      !ts.timerDisplayOverride.trim() &&
      ts.selectionClosesAt
    ) {
      const sec = getRemainingSeconds(ts.selectionClosesAt);
      if (sec <= ts.urgentThresholdSeconds) {
        return 'urgent';
      }
    }
    if (ts.pillTone === 'gold') {
      return 'gold';
    }
    if (ts.pillTone === 'urgent') {
      return 'urgent';
    }
    return 'default';
  });

  private toastTimer: ReturnType<typeof setTimeout> | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly configService: FollowFlowConfigService,
  ) {}

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.contestantName.set(params['name'] ?? '');
    this.contestantImage.set(params['image'] ?? '');

    const fromSelection =
      params['fromSelection'] === '1' || params['fromSelection'] === 'true';
    if (fromSelection) {
      this.showToast.set(true);
      this.toastTimer = setTimeout(() => this.showToast.set(false), 3000);
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { fromSelection: null },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }

    void this.configService.load().then((cfg) => {
      this.banner.set(cfg);
      this.startCountdownIfNeeded(cfg);
    });
  }

  private startCountdownIfNeeded(cfg: FollowFlowConfig): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    const ts = cfg.timerStatus;
    if (
      ts.timerMode !== 'closesIn' ||
      ts.timerDisplayOverride.trim() ||
      !ts.selectionClosesAt.trim()
    ) {
      return;
    }
    this.countdownInterval = setInterval(() => {
      this.tick.update((n) => n + 1);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onChange(): void {
    this.router.navigate(['/select-contestant'], {
      queryParams: {
        name: this.contestantName(),
        image: this.contestantImage(),
      },
    });
  }
}
