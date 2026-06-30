import { computeResultSettlement } from '@/lib/resultSettlement';

describe('resultSettlement', () => {
  it('uses trusted runSession for settlement when available', () => {
    const settlement = computeResultSettlement(
      { score: '10', total: '10', daily: '1' },
      { correct: 4, total: 5, daily: true }
    );

    expect(settlement.correct).toBe(4);
    expect(settlement.total).toBe(5);
    expect(settlement.isDaily).toBe(true);
    expect(settlement.source).toBe('runSession');
    expect(settlement.rejected).toBe(false);
  });

  it('marks mismatch when params differ from trusted runSession', () => {
    const settlement = computeResultSettlement(
      { score: '9', total: '10' },
      { correct: 2, total: 5, daily: false }
    );

    expect(settlement.mismatch).toBe(true);
    expect(settlement.rejected).toBe(false);
    expect(settlement.source).toBe('runSession');
  });

  it('rejects economy settlement when no trusted runSession exists', () => {
    const settlement = computeResultSettlement(
      { score: '3', total: '5', daily: '1', dailySubjectId: 'hist' },
      { correct: 0, total: 0, daily: false }
    );

    expect(settlement.correct).toBe(3);
    expect(settlement.total).toBe(5);
    expect(settlement.isDaily).toBe(true);
    expect(settlement.rejected).toBe(true);
    expect(settlement.source).toBe('params');
  });
});
