import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ScreenContainerComponent } from '../../components/screen-container/screen-container.component';
import { CallToActionButtonComponent } from '../../components/call-to-action-button/call-to-action-button.component';
import { FollowFlowConfigService } from '../../services/follow-flow-config.service';
import {
  FOLLOW_FLOW_FALLBACK,
  FollowFlowConfig,
  formatSelectionCountdown,
  getRemainingSeconds,
} from '../../models/follow-flow-config';

export interface Contestant {
  id: number;
  name: string;
  imageSrc: string;
}

const CONTESTANTS: Contestant[] = [
  { id: 0, name: 'Ashish', imageSrc: '/Contestant.svg' },
  { id: 1, name: 'Avneet', imageSrc: '/Contestant-1.svg' },
  { id: 2, name: 'Bhuvam', imageSrc: '/Contestant-2.svg' },
  { id: 3, name: 'Dolly', imageSrc: '/Contestant-4.svg' },
  { id: 4, name: 'Harsh', imageSrc: '/Contestant-5.svg' },
  { id: 5, name: 'Jannat', imageSrc: '/Contestant-6.svg' },
  { id: 6, name: 'Karan', imageSrc: '/Contestant-7.svg' },
  { id: 7, name: 'Nisha', imageSrc: '/Contestant-10.svg' },
  { id: 8, name: 'Pooja', imageSrc: '/Contestant-11.svg' },
];

@Component({
  selector: 'app-select-contestant',
  standalone: true,
  imports: [ScreenContainerComponent, CallToActionButtonComponent],
  templateUrl: './select-contestant.component.html',
  styleUrl: './select-contestant.component.css',
})
export class SelectContestantComponent implements OnInit, OnDestroy {
  readonly contestants = CONTESTANTS;
  readonly selectedContestant = signal<Contestant | null>(null);
  readonly flowConfig = signal<FollowFlowConfig>(FOLLOW_FLOW_FALLBACK);
  readonly tick = signal(0);
  readonly showSupportToast = signal(false);
  readonly configLoaded = signal(false);

  readonly selectionLocked = computed(() => {
    const c = this.flowConfig();
    return (
      c.selectionWindowClosed || c.timerStatus.selectScreen.headerMode === 'closed'
    );
  });

  readonly selectCountdownText = computed(() => {
    this.tick();
    const ts = this.flowConfig().timerStatus;
    const override = ts.timerDisplayOverride.trim();
    if (override) {
      return override;
    }
    if (!ts.selectionClosesAt.trim()) {
      return '—';
    }
    const sec = getRemainingSeconds(ts.selectionClosesAt);
    return formatSelectionCountdown(sec);
  });

  readonly selectCountdownUrgent = computed(() => {
    this.tick();
    const ts = this.flowConfig().timerStatus;
    if (ts.isUrgent) {
      return true;
    }
    if (!ts.timerDisplayOverride.trim() && ts.selectionClosesAt) {
      const sec = getRemainingSeconds(ts.selectionClosesAt);
      return sec <= ts.urgentThresholdSeconds;
    }
    return false;
  });

  readonly ctaLabel = computed(() => {
    if (this.selectionLocked()) {
      return 'Go back';
    }
    const sel = this.selectedContestant();
    return sel ? `Follow ${sel.name}` : 'Follow';
  });

  readonly showCta = computed(
    () => this.selectionLocked() || this.selectedContestant() !== null,
  );

  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private supportToastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly configService: FollowFlowConfigService,
  ) {}

  ngOnInit(): void {
    void this.configService.load().then((cfg) => {
      this.flowConfig.set(cfg);
      this.applyPreselectionFromRoute();
      this.maybeShowSupportToast(cfg);
      this.startCountdownIfNeeded(cfg);
      this.configLoaded.set(true);
    });
  }

  private applyPreselectionFromRoute(): void {
    const name = this.route.snapshot.queryParamMap.get('name');
    if (!name) {
      return;
    }
    const found = this.contestants.find((c) => c.name === name);
    if (found) {
      this.selectedContestant.set(found);
    }
  }

  private maybeShowSupportToast(cfg: FollowFlowConfig): void {
    const msg = cfg.timerStatus.selectScreen.supportClosedToast.trim();
    const locked =
      cfg.selectionWindowClosed ||
      cfg.timerStatus.selectScreen.headerMode === 'closed';
    if (!msg || !locked) {
      return;
    }
    this.showSupportToast.set(true);
    this.supportToastTimer = setTimeout(() => this.showSupportToast.set(false), 3500);
  }

  private startCountdownIfNeeded(cfg: FollowFlowConfig): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
    if (cfg.timerStatus.selectScreen.headerMode !== 'closesIn') {
      return;
    }
    const ts = cfg.timerStatus;
    if (ts.timerDisplayOverride.trim() || !ts.selectionClosesAt.trim()) {
      return;
    }
    this.countdownInterval = setInterval(() => {
      this.tick.update((n) => n + 1);
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.supportToastTimer) {
      clearTimeout(this.supportToastTimer);
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goBackToFollowing(): void {
    const q = this.route.snapshot.queryParamMap;
    this.router.navigate(['/following'], {
      queryParams: {
        name: q.get('name') ?? '',
        image: q.get('image') ?? '',
      },
    });
  }

  selectContestant(contestant: Contestant): void {
    if (this.selectionLocked()) {
      return;
    }
    const current = this.selectedContestant();
    this.selectedContestant.set(current?.id === contestant.id ? null : contestant);
  }

  isSelected(contestant: Contestant): boolean {
    return this.selectedContestant()?.id === contestant.id;
  }

  onCtaClick(): void {
    if (this.selectionLocked()) {
      this.goBackToFollowing();
      return;
    }
    this.onFollow();
  }

  onFollow(): void {
    const selected = this.selectedContestant();
    if (selected) {
      this.router.navigate(['/following'], {
        queryParams: {
          name: selected.name,
          image: selected.imageSrc,
          fromSelection: '1',
        },
      });
    }
  }
}
