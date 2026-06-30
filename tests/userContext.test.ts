import type { UserAction, UserState } from '../contexts/UserContext';
import { userReducer } from '../contexts/UserContext';

// Mock initial state
const createMockState = (overrides?: Partial<UserState>): UserState => ({
  name: 'Test User',
  grade: 'vwo1',
  level: 'basis',
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
    today: '2025-10-27',
    order: ['nl', 'math', 'hist', 'geo'],
    progress: { nl: 'current', math: 'locked', hist: 'locked', geo: 'locked' },
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

describe('UserContext - runSession Reducer', () => {
  describe('RUN_START', () => {
    it('should initialize a new run session', () => {
      const state = createMockState({ xp: 1000 });
      const action: UserAction = {
        type: 'RUN_START',
        payload: { subjectId: 'math', daily: false, total: 10 },
      };

      const newState = userReducer(state, action);

      expect(newState.runSession).toEqual({
        active: true,
        subjectId: 'math',
        daily: false,
        total: 10,
        correct: 0,
        xpBaseline: 1000,
      });
    });

    it('should initialize a daily challenge run session', () => {
      const state = createMockState({ xp: 2500 });
      const action: UserAction = {
        type: 'RUN_START',
        payload: { subjectId: 'nl', daily: true, total: 5 },
      };

      const newState = userReducer(state, action);

      expect(newState.runSession.active).toBe(true);
      expect(newState.runSession.daily).toBe(true);
      expect(newState.runSession.subjectId).toBe('nl');
      expect(newState.runSession.xpBaseline).toBe(2500);
    });

    it('should reset correct count to 0 when starting new session', () => {
      const state = createMockState({
        runSession: {
          active: false,
          daily: false,
          total: 5,
          correct: 3,
          xpBaseline: 500,
        },
      });

      const action: UserAction = {
        type: 'RUN_START',
        payload: { subjectId: 'hist', daily: false, total: 8 },
      };

      const newState = userReducer(state, action);
      expect(newState.runSession.correct).toBe(0);
    });
  });

  describe('RUN_ADD_CORRECT', () => {
    it('should increment correct count when session is active', () => {
      const state = createMockState({
        runSession: {
          active: true,
          subjectId: 'math',
          daily: false,
          total: 10,
          correct: 3,
          xpBaseline: 500,
        },
      });

      const action: UserAction = { type: 'RUN_ADD_CORRECT' };
      const newState = userReducer(state, action);

      expect(newState.runSession.correct).toBe(4);
      expect(newState.runSession.active).toBe(true);
    });

    it('should not increment correct count when session is inactive', () => {
      const state = createMockState({
        runSession: {
          active: false,
          daily: false,
          total: 10,
          correct: 5,
          xpBaseline: 500,
        },
      });

      const action: UserAction = { type: 'RUN_ADD_CORRECT' };
      const newState = userReducer(state, action);

      // State should remain unchanged
      expect(newState.runSession.correct).toBe(5);
      expect(newState).toEqual(state);
    });

    it('should handle multiple correct answers in sequence', () => {
      let state = createMockState({
        runSession: {
          active: true,
          subjectId: 'geo',
          daily: true,
          total: 5,
          correct: 0,
          xpBaseline: 1000,
        },
      });

      // Add 3 correct answers
      for (let i = 0; i < 3; i++) {
        state = userReducer(state, { type: 'RUN_ADD_CORRECT' });
      }

      expect(state.runSession.correct).toBe(3);
      expect(state.runSession.total).toBe(5);
    });
  });

  describe('RUN_END', () => {
    it('should deactivate the session', () => {
      const state = createMockState({
        runSession: {
          active: true,
          subjectId: 'nl',
          daily: false,
          total: 10,
          correct: 7,
          xpBaseline: 500,
        },
      });

      const action: UserAction = { type: 'RUN_END' };
      const newState = userReducer(state, action);

      expect(newState.runSession.active).toBe(false);
      // Other properties should remain intact
      expect(newState.runSession.correct).toBe(7);
      expect(newState.runSession.total).toBe(10);
      expect(newState.runSession.xpBaseline).toBe(500);
    });

    it('should be idempotent when called multiple times', () => {
      let state = createMockState({
        runSession: {
          active: true,
          daily: false,
          total: 5,
          correct: 3,
          xpBaseline: 1000,
        },
      });

      state = userReducer(state, { type: 'RUN_END' });
      const firstEnd = state;

      state = userReducer(state, { type: 'RUN_END' });
      const secondEnd = state;

      expect(firstEnd.runSession.active).toBe(false);
      expect(secondEnd.runSession.active).toBe(false);
      expect(firstEnd.runSession).toEqual(secondEnd.runSession);
    });
  });

  describe('Complete Run Session Flow', () => {
    it('should handle a complete session lifecycle', () => {
      // Start with fresh state
      let state = createMockState({ xp: 1000 });

      // Start session
      state = userReducer(state, {
        type: 'RUN_START',
        payload: { subjectId: 'math', daily: false, total: 5 },
      });
      expect(state.runSession.active).toBe(true);
      expect(state.runSession.correct).toBe(0);
      expect(state.runSession.xpBaseline).toBe(1000);

      // Add 3 correct answers
      state = userReducer(state, { type: 'RUN_ADD_CORRECT' });
      state = userReducer(state, { type: 'RUN_ADD_CORRECT' });
      state = userReducer(state, { type: 'RUN_ADD_CORRECT' });
      expect(state.runSession.correct).toBe(3);

      // End session
      state = userReducer(state, { type: 'RUN_END' });
      expect(state.runSession.active).toBe(false);
      expect(state.runSession.correct).toBe(3);
    });
  });
});

describe('UserContext - Daily Reset Guard', () => {
  describe('DAILY_RESET', () => {
    it('should reset daily challenge with new date', () => {
      const state = createMockState({
        dailyChallenge: {
          today: '2025-10-26',
          order: ['nl', 'math', 'hist', 'geo'],
          progress: { nl: 'done', math: 'done', hist: 'current', geo: 'locked' },
        },
      });

      const action: UserAction = {
        type: 'DAILY_RESET',
        order: ['math', 'nl', 'geo', 'hist'],
      };

      const newState = userReducer(state, action);

      // Check that today is updated (will be current date)
      expect(newState.dailyChallenge.today).toBeTruthy();
      expect(newState.dailyChallenge.today).not.toBe('2025-10-26');

      // Check that order is updated
      expect(newState.dailyChallenge.order).toEqual(['math', 'nl', 'geo', 'hist']);

      // Check that progress is reset (first should be current, rest locked)
      expect(newState.dailyChallenge.progress.math).toBe('current');
      expect(newState.dailyChallenge.progress.nl).toBe('locked');
      expect(newState.dailyChallenge.progress.geo).toBe('locked');
      expect(newState.dailyChallenge.progress.hist).toBe('locked');
    });

    it('should preserve other state properties during reset', () => {
      const state = createMockState({
        xp: 5000,
        tokens: 500,
        name: 'Advanced Player',
        dailyChallenge: {
          today: '2025-10-26',
          order: ['nl', 'math', 'hist', 'geo'],
          progress: { nl: 'done', math: 'current', hist: 'locked', geo: 'locked' },
        },
      });

      const action: UserAction = {
        type: 'DAILY_RESET',
        order: ['nl', 'math', 'hist', 'geo'],
      };

      const newState = userReducer(state, action);

      // Other properties should remain unchanged
      expect(newState.xp).toBe(5000);
      expect(newState.tokens).toBe(500);
      expect(newState.name).toBe('Advanced Player');
    });
  });

  describe('DAILY_DONE', () => {
    it('should mark current subject as done and unlock next', () => {
      const state = createMockState({
        dailyChallenge: {
          today: '2025-10-27',
          order: ['nl', 'math', 'hist', 'geo'],
          progress: { nl: 'current', math: 'locked', hist: 'locked', geo: 'locked' },
        },
      });

      const action: UserAction = { type: 'DAILY_DONE', subjectId: 'nl' };
      const newState = userReducer(state, action);

      expect(newState.dailyChallenge.progress.nl).toBe('done');
      expect(newState.dailyChallenge.progress.math).toBe('current');
      expect(newState.dailyChallenge.progress.hist).toBe('locked');
    });

    it('should handle completing the last subject', () => {
      const state = createMockState({
        dailyChallenge: {
          today: '2025-10-27',
          order: ['nl', 'math', 'hist', 'geo'],
          progress: { nl: 'done', math: 'done', hist: 'done', geo: 'current' },
        },
      });

      const action: UserAction = { type: 'DAILY_DONE', subjectId: 'geo' };
      const newState = userReducer(state, action);

      expect(newState.dailyChallenge.progress.geo).toBe('done');
      // No more subjects to unlock
      expect(Object.values(newState.dailyChallenge.progress).filter(s => s === 'current')).toHaveLength(0);
    });

    it('should not change state if subject not in order', () => {
      const state = createMockState({
        dailyChallenge: {
          today: '2025-10-27',
          order: ['nl', 'math', 'hist', 'geo'],
          progress: { nl: 'current', math: 'locked', hist: 'locked', geo: 'locked' },
        },
      });

      const action: UserAction = { type: 'DAILY_DONE', subjectId: 'invalid' as any };
      const newState = userReducer(state, action);

      expect(newState).toEqual(state);
    });

    it('should handle completing subjects in sequence', () => {
      let state = createMockState({
        dailyChallenge: {
          today: '2025-10-27',
          order: ['nl', 'math', 'hist', 'geo'],
          progress: { nl: 'current', math: 'locked', hist: 'locked', geo: 'locked' },
        },
      });

      // Complete nl
      state = userReducer(state, { type: 'DAILY_DONE', subjectId: 'nl' });
      expect(state.dailyChallenge.progress.nl).toBe('done');
      expect(state.dailyChallenge.progress.math).toBe('current');

      // Complete math
      state = userReducer(state, { type: 'DAILY_DONE', subjectId: 'math' });
      expect(state.dailyChallenge.progress.math).toBe('done');
      expect(state.dailyChallenge.progress.hist).toBe('current');

      // Complete hist
      state = userReducer(state, { type: 'DAILY_DONE', subjectId: 'hist' });
      expect(state.dailyChallenge.progress.hist).toBe('done');
      expect(state.dailyChallenge.progress.geo).toBe('current');
    });
  });
});

describe('UserContext - Settings', () => {
  it('should persist quizSpeed via SET_SETTINGS', () => {
    const state = createMockState({ quizSpeed: 'normal' });
    const action: UserAction = {
      type: 'SET_SETTINGS',
      payload: { quizSpeed: 'slow' },
    };

    const next = userReducer(state, action);
    expect(next.quizSpeed).toBe('slow');
  });
});
