import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ScreenContainerComponent } from '../../components/screen-container/screen-container.component';
import { HeaderComponent } from '../../components/header/header.component';
import { CallToActionButtonComponent } from '../../components/call-to-action-button/call-to-action-button.component';
import { FollowFlowConfigService } from '../../services/follow-flow-config.service';
import {
  ErrorStateKind,
  FollowFlowConfig,
  mergeFollowFlowConfig,
  parseErrorStateKind,
} from '../../models/follow-flow-config';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [ScreenContainerComponent, HeaderComponent, CallToActionButtonComponent],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.css',
  host: {
    '[class.error-screen--actionable]': 'actionableChrome()',
  },
})
export class ErrorStateComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly configService = inject(FollowFlowConfigService);
  private readonly destroyRef = inject(DestroyRef);

  readonly flow = signal<FollowFlowConfig>(mergeFollowFlowConfig({}));
  readonly errorKind = signal<ErrorStateKind>('general');

  readonly variant = computed(() => this.flow().errorScreens[this.errorKind()]);

  readonly actionableChrome = computed(() => this.errorKind() === 'actionable');

  ngOnInit(): void {
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      if (this.flow().forceErrorScreen) {
        return;
      }
      this.errorKind.set(parseErrorStateKind(params.get('type')));
    });

    void this.configService.load().then((c) => {
      this.flow.set(c);
      if (c.forceErrorScreen) {
        this.errorKind.set(c.forceErrorScreenKind);
      } else {
        this.errorKind.set(parseErrorStateKind(this.route.snapshot.queryParamMap.get('type')));
      }
    });
  }

  onCtaClick(): void {
    const path = this.variant().ctaPath?.trim() || '/select-contestant';
    void this.router.navigateByUrl(path);
  }
}
