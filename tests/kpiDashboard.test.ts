import {
  computeCompletionRateByPack,
  computeD1Retention,
  computeFunnelMetrics,
} from '@/lib/kpiDashboard';

describe('kpiDashboard', () => {
  it('computes funnel metrics', () => {
    const events = [
      { event: 'home_play_tap', props: {}, ts: 1 },
      { event: 'home_play_tap', props: {}, ts: 2 },
      { event: 'quiz_started', props: { packId: 'hist_vwo1_core' }, ts: 3 },
      { event: 'quiz_completed', props: { packId: 'hist_vwo1_core', completed: true }, ts: 4 },
    ];

    const metrics = computeFunnelMetrics(events);
    expect(metrics.homePlayTaps).toBe(2);
    expect(metrics.quizStarts).toBe(1);
    expect(metrics.quizFinishes).toBe(1);
    expect(metrics.quizCompletes).toBe(1);
    expect(metrics.homeToStartRate).toBe(0.5);
    expect(metrics.startToFinishRate).toBe(1);
    expect(metrics.startToCompleteRate).toBe(1);
  });

  it('computes completion rate by pack', () => {
    const events = [
      { event: 'quiz_started', props: { packId: 'a' }, ts: 1 },
      { event: 'quiz_start', props: { packId: 'a' }, ts: 2 }, // legacy
      { event: 'quiz_completed', props: { packId: 'a', completed: true }, ts: 3 },
      { event: 'quiz_started', props: { packId: 'b' }, ts: 4 },
      { event: 'quiz_finish', props: { packId: 'b', completed: false }, ts: 5 }, // legacy
    ];

    const rates = computeCompletionRateByPack(events);
    expect(rates.a).toBe(0.5);
    expect(rates.b).toBe(0);
  });

  it('supports legacy and canonical event names together', () => {
    const events = [
      { event: 'home_play_tap', props: {}, ts: 1 },
      { event: 'quiz_start', props: { packId: 'a' }, ts: 2 }, // legacy
      { event: 'quiz_started', props: { packId: 'b' }, ts: 3 },
      { event: 'quiz_finish', props: { packId: 'a', completed: true }, ts: 4 }, // legacy
      { event: 'quiz_completed', props: { packId: 'b', completed: true }, ts: 5 },
    ];

    const metrics = computeFunnelMetrics(events);
    expect(metrics.quizStarts).toBe(2);
    expect(metrics.quizFinishes).toBe(2);
    expect(metrics.quizCompletes).toBe(2);
  });

  it('computes D1 retention from app_open events', () => {
    const events = [
      { event: 'app_open', props: { local_user_id: 'u1', install_date: '2026-02-10' }, ts: Date.UTC(2026, 1, 10, 10, 0, 0) },
      { event: 'app_open', props: { local_user_id: 'u1', install_date: '2026-02-10' }, ts: Date.UTC(2026, 1, 11, 12, 0, 0) },
      { event: 'app_open', props: { local_user_id: 'u2', install_date: '2026-02-10' }, ts: Date.UTC(2026, 1, 10, 11, 0, 0) },
    ];

    const d1 = computeD1Retention(events);
    expect(d1.cohortUsers).toBe(2);
    expect(d1.retainedUsers).toBe(1);
    expect(d1.retentionRate).toBe(0.5);
    expect(d1.basedOnInstallDateUsers).toBe(2);
  });
});
