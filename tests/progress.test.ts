import { isDailyComplete, userReducer } from '../contexts/UserContext';
import type { UserAction, UserState } from '../contexts/UserContext';

// Mock initial state
const createMockState = (overrides?: Partial<UserState>): UserState => ({
  name: 'Test User',
  grade: '1',
  level: 'VWO',
  xp: 500,
  userLevel: 1,
  tokens: 100,
  lives: 5,
  subjectsUnlocked: true,
  progress: {
    core: { nl: 'locked', math: 'locked', hist: 'locked', geo: 'locked' },
    levels: { nl: [], math: [], hist: [], geo: [] },
  },
  completedQuizzes: { nl: [], math: [], hist: [], geo: [] },
  dailyChallenge: {
    today: '2025-11-03',
    order: ['hist', 'nl', 'math', 'geo'],
    progress: { nl: 'locked', math: 'locked', hist: 'current', geo: 'locked' },
  },
  runSession: {
    active: false,
    daily: false,
    total: 0,
    correct: 0,
    xpBaseline: 0,
  },
  streak: {
    current: 0,
    best: 0,
    lastDay: null,
    streakProtectionPasses: 0,
  },
  bestScores: {
    nl: 0,
    math: 0,
    hist: 0,
    geo: 0,
  },
  soundOn: true,
  hapticsOn: true,
  showXpChip: true,
  quizSpeed: 'normal',
  livesRegen: false,
  livesRegenLastAt: undefined,
  ...overrides,
});

describe('Progress System - Streaks', () => {
  describe('STREAK_UPDATE', () => {
    it('should start streak at 1 when lastDay is null', () => {
      const state = createMockState({
        streak: { current: 0, best: 0, lastDay: null, streakProtectionPasses: 0 },
      });

      const action: UserAction = {
        type: 'STREAK_UPDATE',
        payload: { today: '2025-11-03' },
      };

      const newState = userReducer(state, action);

      expect(newState.streak.current).toBe(1);
      expect(newState.streak.best).toBe(1);
      expect(newState.streak.lastDay).toBe('2025-11-03');
    });

    it('should increment streak on consecutive days', () => {
      const state = createMockState({
        streak: { current: 3, best: 5, lastDay: '2025-11-02', streakProtectionPasses: 0 },
      });

      const action: UserAction = {
        type: 'STREAK_UPDATE',
        payload: { today: '2025-11-03' },
      };

      const newState = userReducer(state, action);

      expect(newState.streak.current).toBe(4); // Incremented
      expect(newState.streak.best).toBe(5); // Unchanged (4 < 5)
      expect(newState.streak.lastDay).toBe('2025-11-03');
    });

    it('should update best streak when current exceeds it', () => {
      const state = createMockState({
        streak: { current: 5, best: 5, lastDay: '2025-11-02', streakProtectionPasses: 0 },
      });

      const action: UserAction = {
        type: 'STREAK_UPDATE',
        payload: { today: '2025-11-03' },
      };

      const newState = userReducer(state, action);

      expect(newState.streak.current).toBe(6);
      expect(newState.streak.best).toBe(6); // Updated
    });

    it('should reset streak to 1 on non-consecutive days', () => {
      const state = createMockState({
        streak: { current: 7, best: 10, lastDay: '2025-11-01', streakProtectionPasses: 0 }, // Skipped day
      });

      const action: UserAction = {
        type: 'STREAK_UPDATE',
        payload: { today: '2025-11-03' },
      };

      const newState = userReducer(state, action);

      expect(newState.streak.current).toBe(1); // Reset
      expect(newState.streak.best).toBe(10); // Best unchanged
      expect(newState.streak.lastDay).toBe('2025-11-03');
    });

    it('should handle long gaps', () => {
      const state = createMockState({
        streak: { current: 5, best: 8, lastDay: '2025-10-01', streakProtectionPasses: 0 },
      });

      const action: UserAction = {
        type: 'STREAK_UPDATE',
        payload: { today: '2025-11-03' },
      };

      const newState = userReducer(state, action);

      expect(newState.streak.current).toBe(1);
      expect(newState.streak.best).toBe(8);
    });

    it('should not double-increment on multiple completes same day', () => {
      const state = createMockState({
        streak: { current: 3, best: 5, lastDay: '2025-11-02', streakProtectionPasses: 0 },
      });

      const action1: UserAction = {
        type: 'STREAK_UPDATE',
        payload: { today: '2025-11-03' },
      };

      const newState1 = userReducer(state, action1);
      expect(newState1.streak.current).toBe(4);

      // Try to update again same day
      const action2: UserAction = {
        type: 'STREAK_UPDATE',
        payload: { today: '2025-11-03' },
      };

      const newState2 = userReducer(newState1, action2);
      expect(newState2.streak.current).toBe(4);
      expect(newState2.streak.best).toBe(5);
      expect(newState2.streak.lastDay).toBe('2025-11-03'); // Unchanged
    });

    it('should reset streak after 2+ day gap', () => {
      const state = createMockState({
        streak: { current: 7, best: 10, lastDay: '2025-11-01', streakProtectionPasses: 0 },
      });

      const action: UserAction = {
        type: 'STREAK_UPDATE',
        payload: { today: '2025-11-04' }, // 3 day gap
      };

      const newState = userReducer(state, action);

      expect(newState.streak.current).toBe(1);
      expect(newState.streak.best).toBe(10); // Best unchanged
    });
  });
});

describe('Progress System - Best Scores', () => {
  describe('BEST_SCORE_SET', () => {
    it('should set initial best score', () => {
      const state = createMockState({
        bestScores: { nl: 0, math: 0, hist: 0, geo: 0 },
      });

      const action: UserAction = {
        type: 'BEST_SCORE_SET',
        payload: { subjectId: 'math', pct: 75 },
      };

      const newState = userReducer(state, action);

      expect(newState.bestScores.math).toBe(75);
    });

    it('should update best score only if higher', () => {
      const state = createMockState({
        bestScores: { nl: 0, math: 60, hist: 0, geo: 0 },
      });

      const action1: UserAction = {
        type: 'BEST_SCORE_SET',
        payload: { subjectId: 'math', pct: 80 },
      };

      const newState1 = userReducer(state, action1);
      expect(newState1.bestScores.math).toBe(80);

      // Try to set lower score
      const action2: UserAction = {
        type: 'BEST_SCORE_SET',
        payload: { subjectId: 'math', pct: 70 },
      };

      const newState2 = userReducer(newState1, action2);
      expect(newState2.bestScores.math).toBe(80); // Unchanged
    });

    it('should not update if score is equal', () => {
      const state = createMockState({
        bestScores: { nl: 0, math: 85, hist: 0, geo: 0 },
      });

      const action: UserAction = {
        type: 'BEST_SCORE_SET',
        payload: { subjectId: 'math', pct: 85 },
      };

      const newState = userReducer(state, action);

      expect(newState.bestScores.math).toBe(85);
      expect(newState).toEqual(state); // No state change
    });

    it('should handle perfect score (100%)', () => {
      const state = createMockState({
        bestScores: { nl: 0, math: 75, hist: 0, geo: 0 },
      });

      const action: UserAction = {
        type: 'BEST_SCORE_SET',
        payload: { subjectId: 'math', pct: 100 },
      };

      const newState = userReducer(state, action);

      expect(newState.bestScores.math).toBe(100);
    });

    it('should update from 80 to 90', () => {
      const state = createMockState({
        bestScores: { nl: 0, math: 80, hist: 0, geo: 0 },
      });

      const action: UserAction = {
        type: 'BEST_SCORE_SET',
        payload: { subjectId: 'math', pct: 90 },
      };

      const newState = userReducer(state, action);

      expect(newState.bestScores.math).toBe(90);
    });

    it('should NOT update from 90 to 70', () => {
      const state = createMockState({
        bestScores: { nl: 0, math: 90, hist: 0, geo: 0 },
      });

      const action: UserAction = {
        type: 'BEST_SCORE_SET',
        payload: { subjectId: 'math', pct: 70 },
      };

      const newState = userReducer(state, action);

      expect(newState.bestScores.math).toBe(90); // Unchanged
    });

    it('should track per-subject independently', () => {
      const state = createMockState({
        bestScores: { nl: 85, math: 70, hist: 60, geo: 0 },
      });

      const action1: UserAction = {
        type: 'BEST_SCORE_SET',
        payload: { subjectId: 'math', pct: 95 },
      };

      const newState1 = userReducer(state, action1);
      expect(newState1.bestScores.math).toBe(95);
      expect(newState1.bestScores.nl).toBe(85); // Other subjects unchanged

      const action2: UserAction = {
        type: 'BEST_SCORE_SET',
        payload: { subjectId: 'hist', pct: 80 },
      };

      const newState2 = userReducer(newState1, action2);
      expect(newState2.bestScores.hist).toBe(80);
      expect(newState2.bestScores.math).toBe(95); // Previous update preserved
    });
  });
});

describe('Progress System - Daily Completion', () => {
  describe('isDailyComplete', () => {
    it('should return false when some subjects are locked', () => {
      const state = createMockState({
        dailyChallenge: {
          today: '2025-11-03',
          order: ['hist', 'nl', 'math', 'geo'],
          progress: { hist: 'done', nl: 'current', math: 'locked', geo: 'locked' },
        },
      });

      expect(isDailyComplete(state)).toBe(false);
    });

    it('should return false when some subjects are current', () => {
      const state = createMockState({
        dailyChallenge: {
          today: '2025-11-03',
          order: ['hist', 'nl', 'math', 'geo'],
          progress: { hist: 'done', nl: 'done', math: 'current', geo: 'locked' },
        },
      });

      expect(isDailyComplete(state)).toBe(false);
    });

    it('should return true when all subjects are done', () => {
      const state = createMockState({
        dailyChallenge: {
          today: '2025-11-03',
          order: ['hist', 'nl', 'math', 'geo'],
          progress: { hist: 'done', nl: 'done', math: 'done', geo: 'done' },
        },
      });

      expect(isDailyComplete(state)).toBe(true);
    });
  });
});

describe('Settings System', () => {
  describe('SET_SETTINGS', () => {
    it('should toggle soundOn', () => {
      const state = createMockState({ soundOn: true });

      const action: UserAction = {
        type: 'SET_SETTINGS',
        payload: { soundOn: false },
      };

      const newState = userReducer(state, action);
      expect(newState.soundOn).toBe(false);
    });

    it('should toggle hapticsOn', () => {
      const state = createMockState({ hapticsOn: true });

      const action: UserAction = {
        type: 'SET_SETTINGS',
        payload: { hapticsOn: false },
      };

      const newState = userReducer(state, action);
      expect(newState.hapticsOn).toBe(false);
    });

    it('should toggle showXpChip', () => {
      const state = createMockState({ showXpChip: true });

      const action: UserAction = {
        type: 'SET_SETTINGS',
        payload: { showXpChip: false },
      };

      const newState = userReducer(state, action);
      expect(newState.showXpChip).toBe(false);
    });

    it('should update multiple settings at once', () => {
      const state = createMockState({ soundOn: true, hapticsOn: true });

      const action: UserAction = {
        type: 'SET_SETTINGS',
        payload: { soundOn: false, hapticsOn: false },
      };

      const newState = userReducer(state, action);
      expect(newState.soundOn).toBe(false);
      expect(newState.hapticsOn).toBe(false);
    });
  });

  describe('SET_LIVES_REGEN', () => {
    it('should enable lives regen and seed timestamp', () => {
      const state = createMockState({ livesRegen: false, lives: 2, livesRegenLastAt: undefined });

      const action: UserAction = {
        type: 'SET_LIVES_REGEN',
        payload: { livesRegen: true },
      };

      const newState = userReducer(state, action);
      expect(newState.livesRegen).toBe(true);
      expect(newState.livesRegenLastAt).toBeDefined();
    });

    it('should disable lives regen', () => {
      const state = createMockState({ livesRegen: true, livesRegenLastAt: '2025-11-03T10:00:00Z' });

      const action: UserAction = {
        type: 'SET_LIVES_REGEN',
        payload: { livesRegen: false },
      };

      const newState = userReducer(state, action);
      expect(newState.livesRegen).toBe(false);
      // Timestamp preserved for future re-enable
    });

    it('should not seed timestamp if lives are full', () => {
      const state = createMockState({ livesRegen: false, lives: 5, livesRegenLastAt: undefined });

      const action: UserAction = {
        type: 'SET_LIVES_REGEN',
        payload: { livesRegen: true },
      };

      const newState = userReducer(state, action);
      expect(newState.livesRegen).toBe(true);
      expect(newState.livesRegenLastAt).toBeUndefined(); // No need to seed at max lives (5)
    });
  });

  describe('LIVES_SET', () => {
    it('should set lives and timestamp', () => {
      const state = createMockState({ lives: 1, livesRegenLastAt: '2025-11-03T10:00:00Z' });
      const newTimestamp = '2025-11-03T10:20:00Z';

      const action: UserAction = {
        type: 'LIVES_SET',
        payload: { lives: 2, livesRegenLastAt: newTimestamp },
      };

      const newState = userReducer(state, action);
      expect(newState.lives).toBe(2);
      expect(newState.livesRegenLastAt).toBe(newTimestamp);
    });

    it('should cap at max 5 lives', () => {
      const state = createMockState({ lives: 4 });

      const action: UserAction = {
        type: 'LIVES_SET',
        payload: { lives: 5, livesRegenLastAt: new Date().toISOString() },
      };

      const newState = userReducer(state, action);
      expect(newState.lives).toBe(5);
    });
  });
});
