import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import type { QuizSpeed } from '@/lib/quizTiming';

// ──────────────────────────────────────────────
// 📌 Type-defs
export type SubjectId = 'nl' | 'math' | 'hist' | 'geo';

export interface CoreProgress {
  nl: 'locked' | 'done';
  math: 'locked' | 'done';
  hist: 'locked' | 'done';
  geo: 'locked' | 'done';
}

export interface LevelData {
  id: number;
  status: 'done' | 'current' | 'locked';
  title?: string;
  img?: string;
}

// Daily challenge order (uitbreidbaar)
export const DAILY_ORDER: SubjectId[] = ['hist', 'nl', 'math', 'geo'];

export type DailyStatus = 'locked' | 'current' | 'done';
export interface DailyChallengeState {
  today: string; // 'yyyy-MM-dd'
  order: SubjectId[];
  progress: Record<SubjectId, DailyStatus>;
}

export interface RunSession {
  active: boolean;
  subjectId?: string;
  daily: boolean;
  total: number;
  correct: number;
  xpBaseline: number;
}

export interface StreakState {
  current: number;
  best: number;
  lastDay: string | null;
  streakProtectionPasses: number;
}

export interface UserState {
  name: string;
  grade: string;
  level: string;
  xp: number;
  userLevel: number; // Player level (1, 2, 3, etc.)
  // Legacy field. Token balance source of truth lives in TokenContext.
  tokens: number;
  lives: number;
  subjectsUnlocked: boolean;
  progress: {
    core: CoreProgress;
    levels: Record<SubjectId, LevelData[]>;
  };
  completedQuizzes: Record<SubjectId, QuizId[]>;
  dailyChallenge: DailyChallengeState;
  runSession: RunSession;
  streak: StreakState;
  bestScores: Record<SubjectId, number>;
  // Settings
  soundOn: boolean;
  hapticsOn: boolean;
  showXpChip: boolean;
  quizSpeed: QuizSpeed;
  // Lives regeneration (feature flag)
  livesRegen: boolean;
  livesRegenLastAt?: string; // ISO timestamp
}

export type QuizId = string;

// ──────────────────────────────────────────────
// 📌 XP & Level helpers
const XP_PER_LEVEL = 1000; // XP needed per level

function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

function calculateXPForNextLevel(currentLevel: number): number {
  return currentLevel * XP_PER_LEVEL;
}

function calculateXPProgress(xp: number): { current: number; next: number; progress: number } {
  const currentLevel = calculateLevel(xp);
  const xpForCurrentLevel = (currentLevel - 1) * XP_PER_LEVEL;
  const xpForNextLevel = currentLevel * XP_PER_LEVEL;
  const progress = (xp - xpForCurrentLevel) / XP_PER_LEVEL;
  
  return {
    current: xp - xpForCurrentLevel,
    next: xpForNextLevel - xp,
    progress: Math.min(progress, 1)
  };
}

// ──────────────────────────────────────────────
// 📌 Date helpers (DST-safe)
function getToday() {
  return new Date().toISOString().slice(0, 10); // 'yyyy-MM-dd'
}

function toUTCDate(dateStr: string): number {
  // dateStr in 'YYYY-MM-DD'
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, m - 1, d); // ms since epoch at 00:00 UTC
}

function isYesterday(lastDay: string | null, today: string): boolean {
  if (!lastDay) return false;
  const diffDays = Math.round((toUTCDate(today) - toUTCDate(lastDay)) / 86400000);
  return diffDays === 1;
}

// ──────────────────────────────────────────────
// 📌 Daily Challenge helpers
export function isDailyComplete(state: UserState): boolean {
  return Object.values(state.dailyChallenge.progress).every(s => s === 'done');
}

function makeDailyProgress(order: SubjectId[]): Record<SubjectId, DailyStatus> {
  const progress: Record<SubjectId, DailyStatus> = { nl: 'locked', math: 'locked', hist: 'locked', geo: 'locked' };
  order.forEach((id, i) => {
    progress[id] = i === 0 ? 'current' : 'locked';
  });
  return progress;
}

function getInitialDailyChallenge(): DailyChallengeState {
  const today = getToday();
  const order = DAILY_ORDER;
  const progress = makeDailyProgress(order);
  return { today, order, progress };
}

const initialState: UserState = {
  name: '',
  grade: '',
  level: '',
  xp: 0,
  userLevel: 1,
  tokens: 0,
  lives: 5,
  subjectsUnlocked: false,
  progress: {
    core: { nl: 'locked', math: 'locked', hist: 'locked', geo: 'locked' },
    levels: { nl: [], math: [], hist: [], geo: [] }
  },
  completedQuizzes: { nl: [], math: [], hist: [], geo: [] },
  dailyChallenge: getInitialDailyChallenge(),
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
  // Settings
  soundOn: true,
  hapticsOn: true,
  showXpChip: true,
  quizSpeed: 'normal',
  // Lives regen (feature flag)
  livesRegen: false,
  livesRegenLastAt: undefined,
};

// ──────────────────────────────────────────────
// 📌 Actions
export type UserAction =
  | { type: 'SET_USER'; payload: Partial<UserState> }
  | { type: 'INTRO_DONE'; subject: SubjectId }
  | { type: 'ADD_COMPLETED_QUIZ'; payload: { subjectId: SubjectId; quizId: QuizId } }
  | { type: 'ADD_XP'; payload: { amount: number } }
  | { type: 'ADD_TOKENS'; payload: { amount: number } }
  | { type: 'DAILY_RESET'; order: SubjectId[] }
  | { type: 'DAILY_DONE'; subjectId: SubjectId }
  | { type: 'RUN_START'; payload: { subjectId?: string; daily: boolean; total: number } }
  | { type: 'RUN_ADD_CORRECT' }
  | { type: 'RUN_END' }
  | { type: 'STREAK_UPDATE'; payload: { today: string } }
  | { type: 'BEST_SCORE_SET'; payload: { subjectId: SubjectId; pct: number } }
  | { type: 'SET_SETTINGS'; payload: { soundOn?: boolean; hapticsOn?: boolean; showXpChip?: boolean; quizSpeed?: QuizSpeed } }
  | { type: 'SET_LIVES_REGEN'; payload: { livesRegen: boolean } }
  | { type: 'LIVES_SET'; payload: { lives: number; livesRegenLastAt?: string } }
  | { type: 'ADD_LIVES'; payload: { count: number } }
  | { type: 'ADD_STREAK_PROTECTION'; payload: { count: number } };

export function userReducer(state: UserState, action: UserAction): UserState {
  // Uncomment for debugging: 
  // if (__DEV__) console.log('[UserReducer]', action.type);
  
  switch (action.type) {
    case 'SET_USER':
      return { ...state, ...action.payload };

    case 'INTRO_DONE': {
      const core = { ...state.progress.core, [action.subject]: 'done' } as CoreProgress;
      const subjectsUnlocked = Object.values(core).every(s => s === 'done');
      return { ...state, progress: { ...state.progress, core }, subjectsUnlocked };
    }

    case 'ADD_COMPLETED_QUIZ': {
      const { subjectId, quizId } = action.payload;
      const list = state.completedQuizzes[subjectId] ?? [];
      if (list.includes(quizId)) return state;
      return {
        ...state,
        completedQuizzes: {
          ...state.completedQuizzes,
          [subjectId]: [...list, quizId],
        },
      };
    }

    case 'ADD_XP': {
      const { amount } = action.payload;
      const newXP = state.xp + amount;
      const newUserLevel = calculateLevel(newXP);
      
      return {
        ...state,
        xp: newXP,
        userLevel: newUserLevel,
      };
    }

    case 'ADD_TOKENS': {
      const { amount } = action.payload;
      return {
        ...state,
        tokens: state.tokens + amount,
      };
    }
    case 'DAILY_RESET': {
      const today = getToday();
      const order = action.order;
      const progress = makeDailyProgress(order);
      return {
        ...state,
        dailyChallenge: { today, order, progress },
      };
    }
    case 'DAILY_DONE': {
      const { subjectId } = action;
      const { order, progress } = state.dailyChallenge;
      const idx = order.indexOf(subjectId);
      if (idx === -1) return state;
      const newProgress = { ...progress, [subjectId]: 'done' };
      if (idx < order.length - 1) {
        const next = order[idx + 1];
        newProgress[next] = 'current';
      }
      return {
        ...state,
        dailyChallenge: {
          ...state.dailyChallenge,
          progress: newProgress,
        },
      };
    }

    case 'RUN_START': {
      const { subjectId, daily, total } = action.payload;
      return {
        ...state,
        runSession: {
          active: true,
          subjectId,
          daily,
          total,
          correct: 0,
          xpBaseline: state.xp,
        },
      };
    }

    case 'RUN_ADD_CORRECT': {
      if (!state.runSession.active) return state;
      return {
        ...state,
        runSession: {
          ...state.runSession,
          correct: state.runSession.correct + 1,
        },
      };
    }

    case 'RUN_END': {
      return {
        ...state,
        runSession: {
          ...state.runSession,
          active: false,
        },
      };
    }

    case 'STREAK_UPDATE': {
      const { today } = action.payload;
      const { streak } = state;

      if (streak.lastDay === today) {
        return state;
      }

      // Check if exactly 1 day gap and has protection passes
      const diffDays = streak.lastDay
        ? Math.round((toUTCDate(today) - toUTCDate(streak.lastDay)) / 86400000)
        : 0;

      let newCurrent: number;
      let newProtectionPasses = streak.streakProtectionPasses;

      if (diffDays === 1 && streak.streakProtectionPasses > 0) {
        // Use protection pass: keep streak going
        newCurrent = streak.current + 1;
        newProtectionPasses = streak.streakProtectionPasses - 1;
      } else if (diffDays > 1) {
        // More than 1 day gap: reset streak (ignore passes)
        newCurrent = 1;
      } else {
        // Same day or consecutive: increment
        newCurrent = isYesterday(streak.lastDay, today) ? streak.current + 1 : 1;
      }

      return {
        ...state,
        streak: {
          current: newCurrent,
          best: Math.max(streak.best, newCurrent),
          lastDay: today,
          streakProtectionPasses: newProtectionPasses,
        },
      };
    }

    case 'BEST_SCORE_SET': {
      const { subjectId, pct } = action.payload;
      const currentBest = state.bestScores[subjectId] || 0;
      
      if (pct > currentBest) {
        return {
          ...state,
          bestScores: {
            ...state.bestScores,
            [subjectId]: pct,
          },
        };
      }
      return state;
    }

    case 'SET_SETTINGS': {
      return {
        ...state,
        ...action.payload,
      };
    }

    case 'SET_LIVES_REGEN': {
      const { livesRegen } = action.payload;
      
      // If enabling regen and lives < 5, seed the timestamp
      if (livesRegen && state.lives < 5 && !state.livesRegenLastAt) {
        return {
          ...state,
          livesRegen,
          livesRegenLastAt: new Date().toISOString(),
        };
      }
      
      return {
        ...state,
        livesRegen,
      };
    }

    case 'LIVES_SET': {
      return {
        ...state,
        lives: action.payload.lives,
        livesRegenLastAt: action.payload.livesRegenLastAt,
      };
    }

    case 'ADD_LIVES': {
      return {
        ...state,
        lives: state.lives + action.payload.count,
      };
    }

    case 'ADD_STREAK_PROTECTION': {
      return {
        ...state,
        streak: {
          ...state.streak,
          streakProtectionPasses: state.streak.streakProtectionPasses + action.payload.count,
        },
      };
    }

    default:
      return state;
  }
}

// 🏗️ Context setup
const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  hydrated: boolean;
}>(null as any);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  const [hydrated, setHydrated] = React.useState(false);
  const lastResetRef = React.useRef<string | null>(null);
  const mountedRef = React.useRef(false);
  const regenIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const regenStartedRef = React.useRef(false);

  // 🔄 Hydrate from AsyncStorage
  useEffect(() => {
    if (mountedRef.current) return;
    
    mountedRef.current = true;
    let isCancelled = false;
    
    const loadUser = async () => {
      try {
        const str = await AsyncStorage.getItem('user');
        
        if (!isCancelled && str) {
          dispatch({ type: 'SET_USER', payload: JSON.parse(str) });
        }
      } catch (e) {
        if (__DEV__) console.error('[UserContext] Storage error:', e);
      } finally {
        if (!isCancelled) {
          setHydrated(true);
        }
      }
    };
    
    loadUser();
    
    return () => {
      isCancelled = true;
    };
  }, []);

  // Daily reset bij nieuwe dag
  useEffect(() => {
    if (!hydrated) return;
    const today = getToday();
    // Check if we need to reset - lastResetRef prevents multiple resets
    if (state.dailyChallenge?.today !== today && lastResetRef.current !== today) {
      lastResetRef.current = today;
      dispatch({ type: 'DAILY_RESET', order: DAILY_ORDER });
    }
    // Note: Only depend on hydrated, not state.dailyChallenge?.today to avoid infinite loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // 💾 Persist on every change - RE-ENABLED with debounce
  useEffect(() => {
    if (!hydrated) return;
    
    const timeoutId = setTimeout(() => {
      AsyncStorage.setItem('user', JSON.stringify(state)).catch(e => {
        if (__DEV__) console.error('[UserContext] Save error:', e);
      });
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [state, hydrated]);

  // 🔄 Lives regeneration (feature flag) - MAX 5 LIVES
  useEffect(() => {
    if (!hydrated) return;
    if (!state.livesRegen) {
      // Cleanup interval if regen disabled
      if (regenIntervalRef.current) {
        clearInterval(regenIntervalRef.current);
        regenIntervalRef.current = null;
        regenStartedRef.current = false;
      }
      return;
    }
    
    // Guard against StrictMode double-mount
    if (regenStartedRef.current) return;
    regenStartedRef.current = true;
    
    // Catch-up: compute missed ticks
    if (state.lives < 5 && state.livesRegenLastAt) {
      const now = new Date().getTime();
      const lastAt = new Date(state.livesRegenLastAt).getTime();
      const elapsedMinutes = (now - lastAt) / 60000;
      const ticks = Math.floor(elapsedMinutes / 20);
      const livesToAdd = Math.min(5 - state.lives, ticks);
      
      if (livesToAdd > 0) {
        dispatch({
          type: 'LIVES_SET',
          payload: {
            lives: state.lives + livesToAdd,
            livesRegenLastAt: new Date().toISOString(),
          },
        });
      }
    }
    
    // Start interval (60s tick)
    const intervalId = setInterval(() => {
      if (state.lives >= 5) return;
      if (!state.livesRegenLastAt) return;
      
      const now = new Date().getTime();
      const lastAt = new Date(state.livesRegenLastAt).getTime();
      const elapsedMinutes = (now - lastAt) / 60000;
      
      if (elapsedMinutes >= 20) {
        dispatch({
          type: 'LIVES_SET',
          payload: {
            lives: Math.min(5, state.lives + 1),
            livesRegenLastAt: new Date().toISOString(),
          },
        });
      }
    }, 60000); // Check every minute
    
    regenIntervalRef.current = intervalId;
    
    return () => {
      if (regenIntervalRef.current) {
        clearInterval(regenIntervalRef.current);
        regenIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, state.livesRegen]); // Intentionally not including state.lives/livesRegenLastAt

  const contextValue = React.useMemo(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated]
  );

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  const { state, dispatch, hydrated } = context;

  // Helper functions - memoized to prevent infinite loops
  const setName = React.useCallback((name: string) => dispatch({ type: 'SET_USER', payload: { name } }), [dispatch]);
  const setGrade = React.useCallback((grade: string) => dispatch({ type: 'SET_USER', payload: { grade } }), [dispatch]);
  const setLevel = React.useCallback((level: string) => dispatch({ type: 'SET_USER', payload: { level } }), [dispatch]);
  const addXP = React.useCallback((amount: number) => dispatch({ type: 'ADD_XP', payload: { amount } }), [dispatch]);
  const addTokens = React.useCallback((amount: number) => dispatch({ type: 'ADD_TOKENS', payload: { amount } }), [dispatch]);
  const consumeLife = React.useCallback(() => dispatch({ type: 'SET_USER', payload: { lives: Math.max(0, state.lives - 1) } }), [dispatch, state.lives]);
  const addCompletedQuiz = React.useCallback(
    (subjectId: SubjectId, quizId: QuizId) => dispatch({ type: 'ADD_COMPLETED_QUIZ', payload: { subjectId, quizId } }),
    [dispatch]
  );
  const dailyReset = React.useCallback(() => dispatch({ type: 'DAILY_RESET', order: DAILY_ORDER }), [dispatch]);
  const dailyDone = React.useCallback((subjectId: SubjectId) => dispatch({ type: 'DAILY_DONE', subjectId }), [dispatch]);
  
  // Streak & Best Score helpers
  const updateStreakIfDailyCleared = React.useCallback((today: string) => {
    dispatch({ type: 'STREAK_UPDATE', payload: { today } });
  }, [dispatch]);
  
  const setBestScore = React.useCallback((subjectId: SubjectId, pct: number) => {
    dispatch({ type: 'BEST_SCORE_SET', payload: { subjectId, pct } });
  }, [dispatch]);
  
  // Settings helpers
  const setSettings = React.useCallback((payload: { soundOn?: boolean; hapticsOn?: boolean; showXpChip?: boolean; quizSpeed?: QuizSpeed }) => {
    dispatch({ type: 'SET_SETTINGS', payload });
  }, [dispatch]);
  
  const toggleSound = React.useCallback(() => {
    dispatch({ type: 'SET_SETTINGS', payload: { soundOn: !state.soundOn } });
  }, [dispatch, state.soundOn]);
  
  const setLivesRegen = React.useCallback((livesRegen: boolean) => {
    dispatch({ type: 'SET_LIVES_REGEN', payload: { livesRegen } });
  }, [dispatch]);

  const addLives = React.useCallback(
    (count: number) => {
      dispatch({ type: 'ADD_LIVES', payload: { count } });
    },
    [dispatch]
  );

  const addStreakProtectionPass = React.useCallback(
    (count: number = 1) => {
      dispatch({ type: 'ADD_STREAK_PROTECTION', payload: { count } });
    },
    [dispatch]
  );

  // XP & Level helper functions - MEMOIZED to prevent re-renders
  const getXPProgress = React.useCallback(() => calculateXPProgress(state.xp), [state.xp]);
  const getXPForNextLevel = React.useCallback(() => calculateXPForNextLevel(state.userLevel), [state.userLevel]);
  const hasLeveledUp = React.useCallback((oldXP: number) => {
    const oldLevel = calculateLevel(oldXP);
    return state.userLevel > oldLevel;
  }, [state.userLevel]);
  // FIX: run session baseline to compute XP this run
  const runStart = React.useCallback(
    (subjectId: string | undefined, daily: boolean, total: number) =>
      dispatch({ type: 'RUN_START', payload: { subjectId, daily, total } }),
    [dispatch]
  );
  const runAddCorrect = React.useCallback(() => dispatch({ type: 'RUN_ADD_CORRECT' }), [dispatch]);
  const runEnd = React.useCallback(() => dispatch({ type: 'RUN_END' }), [dispatch]);
  const getRunXpDelta = React.useCallback(
    () => Math.max(0, state.xp - state.runSession.xpBaseline),
    [state.xp, state.runSession.xpBaseline]
  );

  // CRITICAL: Memoize the entire return object to prevent useInsertionEffect warnings
  return React.useMemo(() => ({
    ...state,
    hydrated,
    setName,
    setGrade,
    setLevel,
    addXP,
    addTokens,
    consumeLife,
    toggleSound,
    addCompletedQuiz,
    dailyReset,
    dailyDone,
    updateStreakIfDailyCleared,
    setBestScore,
    setSettings,
    setLivesRegen,
    getXPProgress,
    getXPForNextLevel,
    hasLeveledUp,
    runStart,
    runAddCorrect,
    runEnd,
    getRunXpDelta,
    addLives,
    addStreakProtectionPass,
    dispatch,
  }), [
    state,
    hydrated,
    setName,
    setGrade,
    setLevel,
    addXP,
    addTokens,
    consumeLife,
    toggleSound,
    addCompletedQuiz,
    dailyReset,
    dailyDone,
    updateStreakIfDailyCleared,
    setBestScore,
    setSettings,
    setLivesRegen,
    getXPProgress,
    getXPForNextLevel,
    hasLeveledUp,
    runStart,
    runAddCorrect,
    runEnd,
    getRunXpDelta,
    addLives,
    addStreakProtectionPass,
    dispatch,
  ]);
};
