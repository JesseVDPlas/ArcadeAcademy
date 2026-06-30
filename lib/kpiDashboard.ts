export interface AnalyticsEvent {
  event: string;
  props: Record<string, any>;
  ts: number;
}

export interface FunnelMetrics {
  homePlayTaps: number;
  quizStarts: number;
  quizFinishes: number;
  quizCompletes: number;
  homeToStartRate: number;
  startToFinishRate: number;
  startToCompleteRate: number;
}

const isQuizStarted = (event: string): boolean =>
  event === 'quiz_started' || event === 'quiz_start';
const isQuizCompletedEvent = (event: string): boolean =>
  event === 'quiz_completed' || event === 'quiz_finish';

export function computeFunnelMetrics(events: AnalyticsEvent[]): FunnelMetrics {
  const homePlayTaps = events.filter((e) => e.event === 'home_play_tap').length;
  const quizStarts = events.filter((e) => isQuizStarted(e.event)).length;
  const quizFinishes = events.filter((e) => isQuizCompletedEvent(e.event)).length;
  const quizCompletes = events.filter(
    (e) => isQuizCompletedEvent(e.event) && e.props.completed === true
  ).length;

  return {
    homePlayTaps,
    quizStarts,
    quizFinishes,
    quizCompletes,
    homeToStartRate: homePlayTaps > 0 ? quizStarts / homePlayTaps : 0,
    startToFinishRate: quizStarts > 0 ? quizFinishes / quizStarts : 0,
    startToCompleteRate: quizStarts > 0 ? quizCompletes / quizStarts : 0,
  };
}

export function computeCompletionRateByPack(events: AnalyticsEvent[]): Record<string, number> {
  const starts: Record<string, number> = {};
  const completes: Record<string, number> = {};

  for (const event of events) {
    if (isQuizStarted(event.event)) {
      const packId = String(event.props.packId || 'unknown_pack');
      starts[packId] = (starts[packId] || 0) + 1;
    }
    if (isQuizCompletedEvent(event.event) && event.props.completed === true) {
      const packId = String(event.props.packId || 'unknown_pack');
      completes[packId] = (completes[packId] || 0) + 1;
    }
  }

  const rates: Record<string, number> = {};
  const packIds = new Set([...Object.keys(starts), ...Object.keys(completes)]);
  for (const packId of packIds) {
    const startCount = starts[packId] || 0;
    const completeCount = completes[packId] || 0;
    rates[packId] = startCount > 0 ? completeCount / startCount : 0;
  }
  return rates;
}

export function computeOverallCompletionRate(events: AnalyticsEvent[]): {
  starts: number;
  completes: number;
  completionRate: number;
} {
  const starts = events.filter((event) => isQuizStarted(event.event)).length;
  const completes = events.filter(
    (event) => isQuizCompletedEvent(event.event) && event.props.completed === true
  ).length;
  return {
    starts,
    completes,
    completionRate: starts > 0 ? completes / starts : 0,
  };
}

export function computeD1Retention(events: AnalyticsEvent[]): {
  cohortUsers: number;
  retainedUsers: number;
  retentionRate: number;
  basedOnInstallDateUsers: number;
} {
  const byUser = new Map<string, Set<string>>();
  const installDateTaggedUsers = new Set<string>();

  for (const event of events) {
    if (event.event !== 'app_open') continue;
    const userId = String(
      event.props.local_user_id ||
      event.props.localUserId ||
      event.props.install_id ||
      event.props.installationId ||
      ''
    );
    if (!userId) continue;
    const dayKey = new Date(event.ts).toISOString().slice(0, 10);
    const set = byUser.get(userId) || new Set<string>();
    set.add(dayKey);
    byUser.set(userId, set);
    if (typeof event.props.installDate === 'string' || typeof event.props.install_date === 'string') {
      installDateTaggedUsers.add(userId);
    }
  }

  let cohortUsers = 0;
  let retainedUsers = 0;
  for (const [, days] of byUser) {
    const sortedDays = Array.from(days).sort();
    if (sortedDays.length === 0) continue;
    cohortUsers += 1;
    if (sortedDays.length >= 2) {
      const first = new Date(sortedDays[0]).getTime();
      const second = new Date(sortedDays[1]).getTime();
      const diffDays = Math.round((second - first) / 86400000);
      if (diffDays === 1) {
        retainedUsers += 1;
      }
    }
  }

  return {
    cohortUsers,
    retainedUsers,
    retentionRate: cohortUsers > 0 ? retainedUsers / cohortUsers : 0,
    basedOnInstallDateUsers: installDateTaggedUsers.size,
  };
}
