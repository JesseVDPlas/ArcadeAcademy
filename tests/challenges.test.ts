import { challengesReducer } from '@/contexts/ChallengesContext';
import { WeeklyChallenges } from '@/types/challenges';
import { weeklyCatalog } from '@/lib/challenges.catalog';
import { isoWeekKey } from '@/lib/time';
import { ChallengeId, ChallengeMetric } from '@/types/challenges';

// Helper to create initial state
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

describe('Challenges', () => {
  describe('rollover', () => {
    it('should build fresh week and archive previous', () => {
      const oldWeekKey = '2024-W01';
      const newWeekKey = '2024-W02';
      const state = createInitialState(oldWeekKey);
      
      // Set some progress
      state.states.weekly_quiz_5.progress = 3;
      state.states.weekly_quiz_5.status = 'completed';

      const newState = challengesReducer(state, {
        type: 'ROLLOVER',
        payload: { weekKey: newWeekKey },
      });

      expect(newState.weekKey).toBe(newWeekKey);
      expect(newState.states.weekly_quiz_5.progress).toBe(0);
      expect(newState.states.weekly_quiz_5.status).toBe('in_progress');
      expect(newState.archived).toHaveLength(1);
      expect(newState.archived![0].weekKey).toBe(oldWeekKey);
      expect(newState.archived![0].summary).toHaveLength(3);
    });
  });

  describe('increment', () => {
    it('should increment progress and cap at target', () => {
      const state = createInitialState(isoWeekKey());
      
      // Increment quizzes 3 times
      let newState = challengesReducer(state, {
        type: 'INCREMENT',
        payload: { metric: 'quizzes', amount: 1 },
      });
      newState = challengesReducer(newState, {
        type: 'INCREMENT',
        payload: { metric: 'quizzes', amount: 1 },
      });
      newState = challengesReducer(newState, {
        type: 'INCREMENT',
        payload: { metric: 'quizzes', amount: 1 },
      });

      expect(newState.states.weekly_quiz_5.progress).toBe(3);
      expect(newState.states.weekly_quiz_5.status).toBe('in_progress');

      // Increment 2 more to reach target
      newState = challengesReducer(newState, {
        type: 'INCREMENT',
        payload: { metric: 'quizzes', amount: 2 },
      });

      expect(newState.states.weekly_quiz_5.progress).toBe(5);
      expect(newState.states.weekly_quiz_5.status).toBe('completed');

      // Try to increment beyond target
      newState = challengesReducer(newState, {
        type: 'INCREMENT',
        payload: { metric: 'quizzes', amount: 10 },
      });

      expect(newState.states.weekly_quiz_5.progress).toBe(5); // Capped
      expect(newState.states.weekly_quiz_5.status).toBe('completed');
    });

    it('should increment dailies when daily completed', () => {
      const state = createInitialState(isoWeekKey());
      
      const newState = challengesReducer(state, {
        type: 'INCREMENT',
        payload: { metric: 'dailies', amount: 1 },
      });

      expect(newState.states.weekly_daily_3.progress).toBe(1);
      expect(newState.states.weekly_daily_3.status).toBe('in_progress');
    });

    it('should increment perfects when perfect score', () => {
      const state = createInitialState(isoWeekKey());
      
      const newState = challengesReducer(state, {
        type: 'INCREMENT',
        payload: { metric: 'perfects', amount: 1 },
      });

      expect(newState.states.weekly_perfect_2.progress).toBe(1);
      expect(newState.states.weekly_perfect_2.status).toBe('in_progress');
    });
  });

  describe('claim', () => {
    it('should grant tokens once and mark as claimed', () => {
      const state = createInitialState(isoWeekKey());
      
      // Complete a challenge
      let newState = challengesReducer(state, {
        type: 'INCREMENT',
        payload: { metric: 'quizzes', amount: 5 },
      });

      expect(newState.states.weekly_quiz_5.status).toBe('completed');

      // Claim it
      newState = challengesReducer(newState, {
        type: 'CLAIM',
        payload: { id: 'weekly_quiz_5' },
      });

      expect(newState.states.weekly_quiz_5.status).toBe('claimed');

      // Try to claim again (should not change)
      const beforeClaim = newState.states.weekly_quiz_5.status;
      newState = challengesReducer(newState, {
        type: 'CLAIM',
        payload: { id: 'weekly_quiz_5' },
      });

      expect(newState.states.weekly_quiz_5.status).toBe(beforeClaim); // Still claimed
    });

    it('should not claim non-completed challenge', () => {
      const state = createInitialState(isoWeekKey());
      
      const newState = challengesReducer(state, {
        type: 'CLAIM',
        payload: { id: 'weekly_quiz_5' },
      });

      expect(newState.states.weekly_quiz_5.status).toBe('in_progress'); // Unchanged
    });
  });
});

