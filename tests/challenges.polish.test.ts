import { challengesReducer } from '@/contexts/ChallengesContext';
import { weeklyCatalog } from '@/lib/challenges.catalog';
import { isoWeekKey } from '@/lib/time';
import { ChallengeId, WeeklyChallenges } from '@/types/challenges';

function createInitialState(weekKey: string): WeeklyChallenges {
  const states = {} as Record<ChallengeId, any>;
  weeklyCatalog.forEach(def => {
    states[def.id] = {
      id: def.id,
      progress: 0,
      status: 'in_progress',
      reward: def.reward,
    };
  });

  return {
    weekKey,
    defs: [...weeklyCatalog],
    states,
    archived: [],
  };
}

describe('Challenges Polish', () => {
  describe('grace period', () => {
    it('should carry completed but unclaimed challenges across week change', () => {
      const oldWeekKey = '2024-W01';
      const newWeekKey = '2024-W02';
      const state = createInitialState(oldWeekKey);
      
      // Complete a challenge but don't claim
      state.states.weekly_quiz_5.progress = 5;
      state.states.weekly_quiz_5.status = 'completed';

      const newState = challengesReducer(state, {
        type: 'ROLLOVER',
        payload: { weekKey: newWeekKey },
      });

      expect(newState.weekKey).toBe(newWeekKey);
      expect(newState.grace).toBeDefined();
      expect(newState.grace?.unclaimed).toContain('weekly_quiz_5');
      expect(newState.grace?.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should allow claiming grace challenges', () => {
      const weekKey = isoWeekKey();
      const state = createInitialState(weekKey);
      
      // Set up grace period
      state.grace = {
        weekKey: '2024-W01',
        unclaimed: ['weekly_quiz_5'],
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      
      // Set up challenge state (completed but not claimed)
      state.states.weekly_quiz_5.status = 'completed';

      const newState = challengesReducer(state, {
        type: 'CLAIM',
        payload: { id: 'weekly_quiz_5' },
      });

      expect(newState.states.weekly_quiz_5.status).toBe('claimed');
      // Grace should be removed when last challenge is claimed
      expect(newState.grace).toBeUndefined();
    });

    it('should remove grace when cleared', () => {
      const weekKey = isoWeekKey();
      const state = createInitialState(weekKey);
      
      state.grace = {
        weekKey: '2024-W01',
        unclaimed: ['weekly_quiz_5'],
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Not expired yet
      };

      const newState = challengesReducer(state, {
        type: 'CLEAR_GRACE',
      });

      expect(newState.grace).toBeUndefined();
    });
  });

  describe('multiple increments per run', () => {
    it('should cap progress at target even with multiple increments', () => {
      const state = createInitialState(isoWeekKey());
      
      // Increment multiple times in one run
      let newState = challengesReducer(state, {
        type: 'INCREMENT',
        payload: { metric: 'quizzes', amount: 3 },
      });
      newState = challengesReducer(newState, {
        type: 'INCREMENT',
        payload: { metric: 'quizzes', amount: 5 },
      });

      expect(newState.states.weekly_quiz_5.progress).toBe(5); // Capped at target
      expect(newState.states.weekly_quiz_5.status).toBe('completed');
    });
  });
});

