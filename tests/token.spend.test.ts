import { tokenReducer, TokenState, TokenEvent } from '@/contexts/TokenContext';
import { userReducer, UserAction, UserState } from '@/contexts/UserContext';
import { flags } from '@/lib/flags';

// Mock analytics
jest.mock('@/lib/analytics', () => ({
  logEvent: jest.fn(),
}));

// Helper to create initial token state
const createTokenState = (overrides?: Partial<TokenState>): TokenState => ({
  balance: 0,
  history: [],
  ...overrides,
});

// Helper to create initial user state
const createUserState = (overrides?: Partial<UserState>): UserState => ({
  name: 'Test',
  grade: 'vwo1',
  level: 'basis',
  xp: 0,
  userLevel: 1,
  tokens: 0,
  lives: 5,
  subjectsUnlocked: false,
  progress: {
    core: { nl: 'locked', math: 'locked', hist: 'locked', geo: 'locked' },
    levels: { nl: [], math: [], hist: [], geo: [] },
  },
  completedQuizzes: { nl: [], math: [], hist: [], geo: [] },
  dailyChallenge: {
    today: '2024-01-01',
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
  bestScores: { nl: 0, math: 0, hist: 0, geo: 0 },
  soundOn: true,
  hapticsOn: true,
  showXpChip: true,
  quizSpeed: 'normal',
  livesRegen: false,
  ...overrides,
});

describe('Token Spend Flow', () => {
  it('should start with known balance after earning tokens', () => {
    const state = createTokenState();
    const event: TokenEvent = {
      type: 'EARN',
      reason: 'quiz_complete',
      amount: 40,
      ts: Date.now(),
    };

    const newState = tokenReducer(state, { type: 'EARN', payload: event });

    expect(newState.balance).toBe(40);
    expect(newState.history.length).toBe(1);
  });

  it('should throw when spending more than balance', () => {
    const state = createTokenState({ balance: 40 });
    const event: TokenEvent = {
      type: 'SPEND',
      reason: 'extra_life_pack',
      amount: 50,
      ts: Date.now(),
    };

    expect(() => {
      tokenReducer(state, { type: 'SPEND', payload: event });
    }).toThrow('Insufficient tokens');
  });

  it('should decrease balance when buying extra lives', () => {
    const state = createTokenState({ balance: 40 });
    const event: TokenEvent = {
      type: 'SPEND',
      reason: 'extra_life_pack',
      amount: 25,
      ts: Date.now(),
    };

    const newState = tokenReducer(state, { type: 'SPEND', payload: event });

    expect(newState.balance).toBe(15);
    expect(newState.history.length).toBe(1);
  });

  it('should increase lives when ADD_LIVES action is dispatched', () => {
    const state = createUserState({ lives: 5 });
    const action: UserAction = {
      type: 'ADD_LIVES',
      payload: { count: 3 },
    };

    const newState = userReducer(state, action);

    expect(newState.lives).toBe(8);
  });

  it('should increase streak protection passes when ADD_STREAK_PROTECTION action is dispatched', () => {
    const state = createUserState({
      streak: {
        current: 5,
        best: 5,
        lastDay: '2024-01-01',
        streakProtectionPasses: 0,
      },
    });
    const action: UserAction = {
      type: 'ADD_STREAK_PROTECTION',
      payload: { count: 1 },
    };

    const newState = userReducer(state, action);

    expect(newState.streak.streakProtectionPasses).toBe(1);
  });

  it('should use streak protection pass when exactly 1 day gap', () => {
    const state = createUserState({
      streak: {
        current: 5,
        best: 5,
        lastDay: '2024-01-01',
        streakProtectionPasses: 1,
      },
    });
    const action: UserAction = {
      type: 'STREAK_UPDATE',
      payload: { today: '2024-01-02' },
    };

    const newState = userReducer(state, action);

    expect(newState.streak.current).toBe(6); // Streak continues
    expect(newState.streak.streakProtectionPasses).toBe(0); // Pass used
  });

  it('should reset streak when gap > 1 day even with protection passes', () => {
    const state = createUserState({
      streak: {
        current: 5,
        best: 5,
        lastDay: '2024-01-01',
        streakProtectionPasses: 2,
      },
    });
    const action: UserAction = {
      type: 'STREAK_UPDATE',
      payload: { today: '2024-01-03' },
    };

    const newState = userReducer(state, action);

    expect(newState.streak.current).toBe(1); // Streak reset
    expect(newState.streak.streakProtectionPasses).toBe(2); // Passes not used
  });

  it('should not show cosmetic items when flags.cosmetics is false', () => {
    expect(flags.cosmetics).toBe(false);
  });

  it('should track token history correctly', () => {
    let state = createTokenState();

    const earn1: TokenEvent = {
      type: 'EARN',
      reason: 'quiz_complete',
      amount: 50,
      meta: { correct: 5, total: 5 },
      ts: Date.now(),
    };
    state = tokenReducer(state, { type: 'EARN', payload: earn1 });

    const earn2: TokenEvent = {
      type: 'EARN',
      reason: 'accuracy_bonus',
      amount: 10,
      ts: Date.now(),
    };
    state = tokenReducer(state, { type: 'EARN', payload: earn2 });

    const spend: TokenEvent = {
      type: 'SPEND',
      reason: 'extra_life_pack',
      amount: 25,
      ts: Date.now(),
    };
    state = tokenReducer(state, { type: 'SPEND', payload: spend });

    expect(state.history.length).toBe(3);
    expect(state.history[0].type).toBe('EARN');
    expect(state.history[0].amount).toBe(50);
    expect(state.history[2].type).toBe('SPEND');
    expect(state.history[2].amount).toBe(25);
  });

  it('should calculate run delta correctly', () => {
    const startTs = Date.now();
    let state = createTokenState();

    const earn1: TokenEvent = {
      type: 'EARN',
      reason: 'quiz_complete',
      amount: 30,
      ts: startTs + 1000,
    };
    state = tokenReducer(state, { type: 'EARN', payload: earn1 });

    const earn2: TokenEvent = {
      type: 'EARN',
      reason: 'accuracy_bonus',
      amount: 10,
      ts: startTs + 2000,
    };
    state = tokenReducer(state, { type: 'EARN', payload: earn2 });

    const spend: TokenEvent = {
      type: 'SPEND',
      reason: 'extra_life_pack',
      amount: 25,
      ts: startTs + 3000,
    };
    state = tokenReducer(state, { type: 'SPEND', payload: spend });

    const events = state.history.filter(e => e.ts >= startTs);
    const earned = events
      .filter((e): e is Extract<TokenEvent, { type: 'EARN' }> => e.type === 'EARN')
      .reduce((sum, e) => sum + e.amount, 0);
    const spent = events
      .filter((e): e is Extract<TokenEvent, { type: 'SPEND' }> => e.type === 'SPEND')
      .reduce((sum, e) => sum + e.amount, 0);

    expect(earned).toBe(40);
    expect(spent).toBe(25);
    expect(earned - spent).toBe(15);
  });
});
