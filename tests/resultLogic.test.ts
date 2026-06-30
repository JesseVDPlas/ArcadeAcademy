import { deriveResultMetrics } from '@/lib/resultLogic';

describe('resultLogic', () => {
  it('uses params as truth for score and total', () => {
    const metrics = deriveResultMetrics(
      { score: '10', total: '10', daily: '1' },
      { correct: 1, total: 10, daily: true }
    );

    expect(metrics.correct).toBe(10);
    expect(metrics.total).toBe(10);
    expect(metrics.isDaily).toBe(true);
  });

  it('flags mismatch when runSession differs from params', () => {
    const metrics = deriveResultMetrics(
      { score: '9', total: '10' },
      { correct: 1, total: 10, daily: false }
    );

    expect(metrics.mismatch).toBe(true);
  });

  it('does not flag mismatch when runSession has no total', () => {
    const metrics = deriveResultMetrics(
      { score: '8', total: '10' },
      { correct: 0, total: 0, daily: false }
    );

    expect(metrics.mismatch).toBe(false);
  });

  it('treats dailySubjectId as daily hint when daily flag is missing', () => {
    const metrics = deriveResultMetrics(
      { score: '4', total: '5', dailySubjectId: 'hist' },
      { correct: 4, total: 5, daily: false }
    );

    expect(metrics.isDaily).toBe(true);
  });
});
