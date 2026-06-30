/**
 * Tests for leaderboard period aggregation
 */
import { aggregateTokensByPeriod, LeaderboardPeriod } from '@/contexts/LeaderboardContext';
import { TokenEvent } from '@/contexts/TokenContext';

describe('Leaderboard Period Aggregation', () => {
  // Base date: Monday Jan 6, 2025 (ISO week 2)
  const base = Date.UTC(2025, 0, 6, 12, 0, 0); // Jan 6, 2025 12:00 UTC

  const createEarnEvent = (
    amount: number,
    daysOffset: number,
    alias?: string
  ): TokenEvent => {
    const event: TokenEvent = {
      type: 'EARN',
      reason: 'quiz_complete',
      amount,
      ts: base + daysOffset * 86400000, // Add days
    };

    if (alias) {
      event.meta = { alias };
    }

    return event;
  };

  const createSpendEvent = (amount: number, daysOffset: number): TokenEvent => ({
    type: 'SPEND',
    reason: 'extra_life_pack',
    amount,
    ts: base + daysOffset * 86400000,
  });

  describe('Weekly aggregation', () => {
    it('should only count events from current ISO week', () => {
      const history: TokenEvent[] = [
        createEarnEvent(10, 0, 'You'), // Same week
        createEarnEvent(20, 1, 'A'), // Same week (+1 day)
        createEarnEvent(5, 7, 'You'), // Next week (+7 days)
      ];

      const result = aggregateTokensByPeriod(history, 'weekly', 'You', new Date(base));

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ alias: 'A', tokens: 20 });
      expect(result[1]).toMatchObject({ alias: 'You', tokens: 10 });
    });

    it('should ignore spend events', () => {
      const history: TokenEvent[] = [
        createEarnEvent(10, 0, 'You'),
        createSpendEvent(5, 1),
        createEarnEvent(20, 2, 'A'),
      ];

      const result = aggregateTokensByPeriod(history, 'weekly', 'You', new Date(base));

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ alias: 'A', tokens: 20 });
      expect(result[1]).toMatchObject({ alias: 'You', tokens: 10 });
    });
  });

  describe('Monthly aggregation', () => {
    it('should only count events from current month', () => {
      const history: TokenEvent[] = [
        createEarnEvent(10, 0, 'You'), // January
        createEarnEvent(20, 1, 'A'), // January
        createEarnEvent(5, 40, 'You'), // February (+40 days)
      ];

      const result = aggregateTokensByPeriod(history, 'monthly', 'You', new Date(base));

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ alias: 'A', tokens: 20 });
      expect(result[1]).toMatchObject({ alias: 'You', tokens: 10 });
    });
  });

  describe('All-time aggregation', () => {
    it('should sum all earn events across all time', () => {
      const history: TokenEvent[] = [
        createEarnEvent(10, 0, 'You'),
        createEarnEvent(20, 1, 'A'),
        createEarnEvent(5, 40, 'You'), // Different month
        createEarnEvent(15, 100, 'B'), // Different month
      ];

      const result = aggregateTokensByPeriod(history, 'all_time', 'You', new Date(base));

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({ alias: 'A', tokens: 20 });
      expect(result[1]).toMatchObject({ alias: 'You', tokens: 15 }); // 10 + 5
      expect(result[2]).toMatchObject({ alias: 'B', tokens: 15 });
    });
  });

  describe('Sorting and tiebreaker', () => {
    it('should sort by tokens desc, then ts asc (earlier wins)', () => {
      const history: TokenEvent[] = [
        createEarnEvent(20, 0, 'A'), // 20 tokens, earlier
        createEarnEvent(20, 2, 'B'), // 20 tokens, later (should rank #2)
        createEarnEvent(30, 1, 'C'), // 30 tokens (should rank #1)
        createEarnEvent(10, 3, 'D'), // 10 tokens (should rank #4)
      ];

      const result = aggregateTokensByPeriod(history, 'all_time', undefined, new Date(base));

      expect(result).toHaveLength(4);
      expect(result[0]).toMatchObject({ alias: 'C', tokens: 30 });
      expect(result[1]).toMatchObject({ alias: 'A', tokens: 20 }); // Earlier ts wins tie
      expect(result[2]).toMatchObject({ alias: 'B', tokens: 20 });
      expect(result[3]).toMatchObject({ alias: 'D', tokens: 10 });
    });
  });

  describe('Empty history', () => {
    it('should return empty array when history is empty', () => {
      const result = aggregateTokensByPeriod([], 'weekly', undefined, new Date(base));
      expect(result).toEqual([]);
    });

    it('should return empty array when only spend events exist', () => {
      const history: TokenEvent[] = [
        createSpendEvent(10, 0),
        createSpendEvent(20, 1),
      ];

      const result = aggregateTokensByPeriod(history, 'weekly', undefined, new Date(base));
      expect(result).toEqual([]);
    });
  });

  describe('Alias handling', () => {
    it('should use alias from meta if available', () => {
      const history: TokenEvent[] = [
        createEarnEvent(10, 0, 'CustomAlias'),
        createEarnEvent(20, 1), // No alias in meta, should use default
      ];

      const result = aggregateTokensByPeriod(history, 'all_time', 'You', new Date(base));

      expect(result).toHaveLength(2);
      const aliases = result.map(r => r.alias);
      expect(aliases).toContain('CustomAlias');
      expect(aliases).toContain('You');
    });

    it('should default to "You" when no alias provided', () => {
      const history: TokenEvent[] = [
        createEarnEvent(10, 0), // No alias
      ];

      const result = aggregateTokensByPeriod(history, 'all_time', undefined, new Date(base));

      expect(result).toHaveLength(1);
      expect(result[0].alias).toBe('You');
    });
  });
});
