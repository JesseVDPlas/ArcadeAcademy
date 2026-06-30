import { leaderboardReducer } from '@/contexts/LeaderboardContext';
import { isoWeekKey } from '@/lib/time';
import { LeaderboardState } from '@/types/leaderboard';

function createInitialState(weekKey: string): LeaderboardState {
  return {
    weekKey,
    entries: [],
    alias: undefined,
    me: undefined,
    lastSubmitAt: undefined,
  };
}

describe('Leaderboard Polish', () => {
  describe('alias validation', () => {
    it('should accept valid aliases', () => {
      const state = createInitialState(isoWeekKey());
      
      const newState = leaderboardReducer(state, {
        type: 'SET_ALIAS',
        payload: { alias: 'ValidAlias123' },
      });

      expect(newState.alias).toBe('ValidAlias123');
    });

    it('should accept aliases with underscores and dashes', () => {
      const state = createInitialState(isoWeekKey());
      
      const newState = leaderboardReducer(state, {
        type: 'SET_ALIAS',
        payload: { alias: 'valid_alias-123' },
      });

      expect(newState.alias).toBe('valid_alias-123');
    });
  });

  describe('cooldown', () => {
    it('should set lastSubmitAt on submit', () => {
      const state = createInitialState(isoWeekKey());
      state.alias = 'TestPlayer';
      
      const entry = { alias: 'TestPlayer', tokens: 100, ts: Date.now() };
      const newState = leaderboardReducer(state, {
        type: 'SUBMIT_ENTRY',
        payload: { entry },
      });

      expect(newState.lastSubmitAt).toBeDefined();
      expect(newState.lastSubmitAt).toBeGreaterThan(Date.now() - 1000);
    });

    it('should allow resubmit after cooldown expires', () => {
      const state = createInitialState(isoWeekKey());
      state.alias = 'TestPlayer';
      const oldSubmitAt = Date.now() - 16 * 60 * 1000; // 16 minutes ago
      state.lastSubmitAt = oldSubmitAt;
      
      const entry = { alias: 'TestPlayer', tokens: 150, ts: Date.now() };
      const beforeSubmit = Date.now();
      const newState = leaderboardReducer(state, {
        type: 'SUBMIT_ENTRY',
        payload: { entry },
      });

      expect(newState.lastSubmitAt).toBeDefined();
      expect(newState.lastSubmitAt!).toBeGreaterThanOrEqual(beforeSubmit);
    });
  });
});

