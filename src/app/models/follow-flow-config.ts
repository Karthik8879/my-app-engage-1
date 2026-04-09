export type TimerMode = 'none' | 'closesOn' | 'closesIn';
export type PillTone = 'default' | 'gold' | 'urgent';
export type SelectHeaderMode = 'dateOn' | 'closesIn' | 'closed';

export interface LifeSaverBarConfig {
  show: boolean;
  text: string;
  isUrgent: boolean;
  howItWorksUrl: string;
}

export interface SelectScreenConfig {
  headerMode: SelectHeaderMode;
  dateLabel: string;
  closedTitle: string;
  supportClosedToast: string;
}

export interface GuestFlowConfig {
  enabled: boolean;
  selectSubtitle: string;
  loginBannerText: string;
  loginToastText: string;
}

export type ErrorStateKind = 'general' | 'network' | 'location' | 'actionable';

export interface ErrorScreenVariantConfig {
  iconSrc: string;
  title: string;
  subtitle: string;
  showCta: boolean;
  ctaLabel?: string;
  ctaPath?: string;
}

export type ErrorScreensConfig = Record<ErrorStateKind, ErrorScreenVariantConfig>;

export function parseErrorStateKind(raw: string | null | undefined): ErrorStateKind {
  if (raw === 'general' || raw === 'network' || raw === 'location' || raw === 'actionable') {
    return raw;
  }
  return 'general';
}

/** CMS / JSON may send boolean as string; normalize for merge. */
function coerceBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (value === 'true' || value === 1) {
    return true;
  }
  if (value === 'false' || value === 0) {
    return false;
  }
  return fallback;
}

export interface TimerStatusConfig {
  showTimerPill: boolean;
  timerMode: TimerMode;
  closesOnLabel: string;
  selectionClosesAt: string;
  timerDisplayOverride: string;
  urgentThresholdSeconds: number;
  isUrgent: boolean;
  pillTone: PillTone;
  lifeSaverBar: LifeSaverBarConfig;
  selectScreen: SelectScreenConfig;
}

export interface FollowFlowConfig {
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
  timerStatus: TimerStatusConfig;
  guestFlow: GuestFlowConfig;
  errorScreens: ErrorScreensConfig;
  /** When true, every guarded route redirects to `/error` (see forceErrorScreenGuard). */
  forceErrorScreen: boolean;
  /** Query `type` for the forced error screen (default general). */
  forceErrorScreenKind: ErrorStateKind;
}

export const DEFAULT_TIMER_STATUS: TimerStatusConfig = {
  showTimerPill: false,
  timerMode: 'none',
  closesOnLabel: '15th MARCH',
  selectionClosesAt: '',
  timerDisplayOverride: '',
  urgentThresholdSeconds: 600,
  isUrgent: false,
  pillTone: 'default',
  lifeSaverBar: {
    show: false,
    text: '',
    isUrgent: false,
    howItWorksUrl: '',
  },
  selectScreen: {
    headerMode: 'closesIn',
    dateLabel: '15th March',
    closedTitle: 'Selection window is closed now',
    supportClosedToast: '',
  },
};

export const DEFAULT_GUEST_FLOW: GuestFlowConfig = {
  enabled: false,
  selectSubtitle: 'Tap on the contestant you want to follow',
  loginBannerText: 'Login to follow a contestant',
  loginToastText: 'Login to follow a contestant',
};

export const DEFAULT_ERROR_SCREENS: ErrorScreensConfig = {
  general: {
    iconSrc: '/error_jv.svg',
    title: 'Oops! Something Went Wrong.',
    subtitle: 'Please come back after some time to continue playing.',
    showCta: false,
  },
  network: {
    iconSrc: '/error_jv.svg',
    title: 'Network Error',
    subtitle:
      'Unable to connect to JioHotstar. This could be a problem with your network connection.',
    showCta: false,
  },
  location: {
    iconSrc: '/notAvailableLocationIcon.svg',
    title: 'Not available in your location',
    subtitle: '',
    showCta: false,
  },
  actionable: {
    iconSrc: '/SomethingWentWrongIcon.svg',
    title: 'Something went wrong!',
    subtitle: 'Please select a contestant to follow again.',
    showCta: true,
    ctaLabel: 'Follow a contestant',
    ctaPath: '/select-contestant',
  },
};

export const FOLLOW_FLOW_FALLBACK: FollowFlowConfig = {
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
  timerStatus: DEFAULT_TIMER_STATUS,
  guestFlow: DEFAULT_GUEST_FLOW,
  errorScreens: DEFAULT_ERROR_SCREENS,
  forceErrorScreen: false,
  forceErrorScreenKind: 'general',
};

function mergeErrorVariant(
  fallback: ErrorScreenVariantConfig,
  data?: Partial<ErrorScreenVariantConfig>,
): ErrorScreenVariantConfig {
  const v = data ?? {};
  return {
    iconSrc: v.iconSrc ?? fallback.iconSrc,
    title: v.title ?? fallback.title,
    subtitle: v.subtitle ?? fallback.subtitle,
    showCta: coerceBoolean(v.showCta, fallback.showCta),
    ctaLabel: v.ctaLabel ?? fallback.ctaLabel,
    ctaPath: v.ctaPath ?? fallback.ctaPath,
  };
}

function mergeErrorScreens(
  data?: Partial<Record<ErrorStateKind, Partial<ErrorScreenVariantConfig>>>,
): ErrorScreensConfig {
  const e = data ?? {};
  return {
    general: mergeErrorVariant(DEFAULT_ERROR_SCREENS.general, e.general),
    network: mergeErrorVariant(DEFAULT_ERROR_SCREENS.network, e.network),
    location: mergeErrorVariant(DEFAULT_ERROR_SCREENS.location, e.location),
    actionable: mergeErrorVariant(DEFAULT_ERROR_SCREENS.actionable, e.actionable),
  };
}

function mergeGuestFlow(data?: Partial<GuestFlowConfig>): GuestFlowConfig {
  const g = data ?? {};
  return {
    enabled: g.enabled ?? DEFAULT_GUEST_FLOW.enabled,
    selectSubtitle: g.selectSubtitle ?? DEFAULT_GUEST_FLOW.selectSubtitle,
    loginBannerText: g.loginBannerText ?? DEFAULT_GUEST_FLOW.loginBannerText,
    loginToastText: g.loginToastText ?? DEFAULT_GUEST_FLOW.loginToastText,
  };
}

function mergeTimerStatus(data?: Partial<TimerStatusConfig>): TimerStatusConfig {
  const t = data ?? {};
  const ls: Partial<LifeSaverBarConfig> = t.lifeSaverBar ?? {};
  const ss: Partial<SelectScreenConfig> = t.selectScreen ?? {};
  return {
    showTimerPill: t.showTimerPill ?? DEFAULT_TIMER_STATUS.showTimerPill,
    timerMode: t.timerMode ?? DEFAULT_TIMER_STATUS.timerMode,
    closesOnLabel: t.closesOnLabel ?? DEFAULT_TIMER_STATUS.closesOnLabel,
    selectionClosesAt: t.selectionClosesAt ?? DEFAULT_TIMER_STATUS.selectionClosesAt,
    timerDisplayOverride: t.timerDisplayOverride ?? DEFAULT_TIMER_STATUS.timerDisplayOverride,
    urgentThresholdSeconds:
      t.urgentThresholdSeconds ?? DEFAULT_TIMER_STATUS.urgentThresholdSeconds,
    isUrgent: t.isUrgent ?? DEFAULT_TIMER_STATUS.isUrgent,
    pillTone: t.pillTone ?? DEFAULT_TIMER_STATUS.pillTone,
    lifeSaverBar: {
      show: ls.show ?? DEFAULT_TIMER_STATUS.lifeSaverBar.show,
      text: ls.text ?? DEFAULT_TIMER_STATUS.lifeSaverBar.text,
      isUrgent: ls.isUrgent ?? DEFAULT_TIMER_STATUS.lifeSaverBar.isUrgent,
      howItWorksUrl: ls.howItWorksUrl ?? DEFAULT_TIMER_STATUS.lifeSaverBar.howItWorksUrl,
    },
    selectScreen: {
      headerMode: ss.headerMode ?? DEFAULT_TIMER_STATUS.selectScreen.headerMode,
      dateLabel: ss.dateLabel ?? DEFAULT_TIMER_STATUS.selectScreen.dateLabel,
      closedTitle: ss.closedTitle ?? DEFAULT_TIMER_STATUS.selectScreen.closedTitle,
      supportClosedToast:
        ss.supportClosedToast ?? DEFAULT_TIMER_STATUS.selectScreen.supportClosedToast,
    },
  };
}

export function mergeFollowFlowConfig(data: Partial<FollowFlowConfig>): FollowFlowConfig {
  return {
    showBanner: data.showBanner ?? FOLLOW_FLOW_FALLBACK.showBanner,
    title: data.title ?? FOLLOW_FLOW_FALLBACK.title,
    subtitle: data.subtitle ?? FOLLOW_FLOW_FALLBACK.subtitle,
    logoSrc: data.logoSrc ?? FOLLOW_FLOW_FALLBACK.logoSrc,
    isEliminated: data.isEliminated ?? FOLLOW_FLOW_FALLBACK.isEliminated,
    eliminatedName: data.eliminatedName ?? FOLLOW_FLOW_FALLBACK.eliminatedName,
    selectionWindowClosed:
      data.selectionWindowClosed ?? FOLLOW_FLOW_FALLBACK.selectionWindowClosed,
    isFollowing: data.isFollowing ?? FOLLOW_FLOW_FALLBACK.isFollowing,
    openWindowDescription:
      data.openWindowDescription ?? FOLLOW_FLOW_FALLBACK.openWindowDescription,
    closedWindowShortDescription:
      data.closedWindowShortDescription ??
      FOLLOW_FLOW_FALLBACK.closedWindowShortDescription,
    closedWindowFollowingDescription:
      data.closedWindowFollowingDescription ??
      FOLLOW_FLOW_FALLBACK.closedWindowFollowingDescription,
    eliminatedClosedSubcaption:
      data.eliminatedClosedSubcaption ??
      FOLLOW_FLOW_FALLBACK.eliminatedClosedSubcaption,
    timerStatus: mergeTimerStatus(data.timerStatus),
    guestFlow: mergeGuestFlow(data.guestFlow),
    errorScreens: mergeErrorScreens(data.errorScreens),
    forceErrorScreen: coerceBoolean(data.forceErrorScreen, FOLLOW_FLOW_FALLBACK.forceErrorScreen),
    forceErrorScreenKind:
      typeof data.forceErrorScreenKind === 'string'
        ? parseErrorStateKind(data.forceErrorScreenKind)
        : FOLLOW_FLOW_FALLBACK.forceErrorScreenKind,
  };
}

export function getRemainingSeconds(selectionClosesAtIso: string): number {
  if (!selectionClosesAtIso?.trim()) {
    return 0;
  }
  const end = Date.parse(selectionClosesAtIso);
  if (Number.isNaN(end)) {
    return 0;
  }
  return Math.max(0, Math.floor((end - Date.now()) / 1000));
}

export function formatSelectionCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) {
    return '0m 0s';
  }
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  return `${m}m ${s}s`;
}
