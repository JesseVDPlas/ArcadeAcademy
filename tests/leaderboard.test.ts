import { leaderboardReducer } from '@/contexts/LeaderboardContext';
import { LeaderboardState } from '@/types/leaderboard';
import { isoWeekKey } from '@/lib/time';
import { LeaderEntry } from '@/types/leaderboard';

// Helper to create initial state
function createInitialState(weekKey: string): LeaderboardState {
  return {
    weekKey,
    entries: [],
    alias: undefined,
    me: undefined,
  };
}

describe('Leaderboard', () => {
  describe('setAlias', () => {
    it('should set alias', () => {
      const state = createInitialState(isoWeekKey());
      
      const newState = leaderboardReducer(state, {
        type: 'SET_ALIAS',
        payload: { alias: 'TestPlayer' },
      });

      expect(newState.alias).toBe('TestPlayer');
    });
  });

  describe('submit', () => {
    it('should add entry and appear in entries', () => {
      const state = createInitialState(isoWeekKey());
      
      const entry: LeaderEntry = {
        alias: 'TestPlayer',
        tokens: 100,
        ts: Date.now(),
      };

      const newState = leaderboardReducer(state, {
        type: 'SET_ALIAS',
        payload: { alias: 'TestPlayer' },
      });

      const finalState = leaderboardReducer(newState, {
        type: 'SUBMIT_ENTRY',
        payload: { entry },
      });

      expect(finalState.entries).toHaveLength(1);
      expect(finalState.entries[0].alias).toBe('TestPlayer');
      expect(finalState.entries[0].tokens).toBe(100);
      expect(finalState.me).toEqual(entry);
    });

    it('should sort by tokens desc, then ts asc (tiebreaker)', () => {
      const state = createInitialState(isoWeekKey());
      
      const now = Date.now();
      const entry1: LeaderEntry = { alias: 'Player1', tokens: 100, ts: now + 1000 };
      const entry2: LeaderEntry = { alias: 'Player2', tokens: 100, ts: now };
      const entry3: LeaderEntry = { alias: 'Player3', tokens: 150, ts: now + 2000 };

      let newState = leaderboardReducer(state, {
        type: 'SUBMIT_ENTRY',
        payload: { entry: entry1 },
      });
      newState = leaderboardReducer(newState, {
        type: 'SUBMIT_ENTRY',
        payload: { entry: entry2 },
      });
      newState = leaderboardReducer(newState, {
        type: 'SUBMIT_ENTRY',
        payload: { entry: entry3 },
      });

      expect(newState.entries[0].alias).toBe('Player3'); // Highest tokens
      expect(newState.entries[1].alias).toBe('Player2'); // Earlier ts (tiebreaker)
      expect(newState.entries[2].alias).toBe('Player1'); // Later ts
    });

    it('should upsert by alias', () => {
      const state = createInitialState(isoWeekKey());
      
      const entry1: LeaderEntry = { alias: 'Player1', tokens: 100, ts: Date.now() };
      const entry2: LeaderEntry = { alias: 'Player1', tokens: 150, ts: Date.now() + 1000 };

      let newState = leaderboardReducer(state, {
        type: 'SUBMIT_ENTRY',
        payload: { entry: entry1 },
      });
      newState = leaderboardReducer(newState, {
        type: 'SUBMIT_ENTRY',
        payload: { entry: entry2 },
      });

      expect(newState.entries).toHaveLength(1);
      expect(newState.entries[0].tokens).toBe(150); // Updated value
    });
  });

  describe('rollover', () => {
    it('should create separate board for new isoWeekKey', () => {
      const oldWeekKey = '2024-W01';
      const newWeekKey = '2024-W02';
      const state = createInitialState(oldWeekKey);
      
      // Add some entries
      const entry: LeaderEntry = { alias: 'Player1', tokens: 100, ts: Date.now() };
      let newState = leaderboardReducer(state, {
        type: 'SUBMIT_ENTRY',
        payload: { entry },
      });

      expect(newState.entries).toHaveLength(1);

      // Rollover
      newState = leaderboardReducer(newState, {
        type: 'ROLLOVER',
        payload: { weekKey: newWeekKey },
      });

      expect(newState.weekKey).toBe(newWeekKey);
      expect(newState.entries).toHaveLength(0); // Fresh board
    });
  });
});

