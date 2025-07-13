import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

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

export interface UserState {
  name: string;
  grade: string;
  level: string;
  xp: number;
  tokens: number;
  lives: number;
  subjectsUnlocked: boolean;
  progress: {
    core: CoreProgress;
    levels: Record<SubjectId, LevelData[]>;
  };
  preferredSubjects: string[];
  completedQuizzes: Record<SubjectId, QuizId[]>;
  dailyChallenge: DailyChallengeState;
}

export type QuizId = string;

// ──────────────────────────────────────────────
// 📌 Initial state
function getToday() {
  return new Date().toISOString().slice(0, 10); // 'yyyy-MM-dd'
}

// Helper to create a fully-typed progress object
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
  tokens: 0,
  lives: 3,
  subjectsUnlocked: false,
  progress: {
    core: { nl: 'locked', math: 'locked', hist: 'locked', geo: 'locked' },
    levels: { nl: [], math: [], hist: [], geo: [] }
  },
  preferredSubjects: [],
  completedQuizzes: { nl: [], math: [], hist: [], geo: [] },
  dailyChallenge: getInitialDailyChallenge(),
};

// ──────────────────────────────────────────────
// 📌 Actions
type Action =
  | { type: 'SET_USER'; payload: Partial<UserState> }
  | { type: 'INTRO_DONE'; subject: SubjectId }
  | { type: 'ADD_COMPLETED_QUIZ'; payload: { subjectId: SubjectId; quizId: QuizId } }
  | { type: 'DAILY_RESET'; order: SubjectId[] }
  | { type: 'DAILY_DONE'; subjectId: SubjectId };

function reducer(state: UserState, action: Action): UserState {
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

    default:
      return state;
  }
}

// 🏗️ Context setup
const UserContext = createContext<{
  state: UserState;
  dispatch: React.Dispatch<Action>;
  hydrated: boolean;
  soundOn: boolean;
  toggleSound: () => void;
}>(null as any);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [hydrated, setHydrated] = React.useState(false);
  const [soundOn, setSoundOn] = React.useState(true);

  // 🔄 Hydrate from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem('user').then(str => {
      if (str) dispatch({ type: 'SET_USER', payload: JSON.parse(str) });
      setHydrated(true);
    });
  }, []);

  // Daily reset bij nieuwe dag
  useEffect(() => {
    if (!hydrated) return;
    const today = getToday();
    if (state.dailyChallenge?.today !== today) {
      dispatch({ type: 'DAILY_RESET', order: DAILY_ORDER });
    }
  }, [hydrated, state.dailyChallenge?.today]);

  // 💾 Persist on every change
  useEffect(() => {
    if (hydrated) AsyncStorage.setItem('user', JSON.stringify(state));
  }, [state, hydrated]);

  const toggleSound = () => setSoundOn((s) => !s);

  return (
    <UserContext.Provider value={{ state, dispatch, hydrated, soundOn, toggleSound }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  const { state, dispatch, hydrated, soundOn, toggleSound } = context;

  // Helper functions
  const setName = (name: string) => dispatch({ type: 'SET_USER', payload: { name } });
  const setGrade = (grade: string) => dispatch({ type: 'SET_USER', payload: { grade } });
  const setLevel = (level: string) => dispatch({ type: 'SET_USER', payload: { level } });
  const setPreferredSubjects = (preferredSubjects: string[]) => dispatch({ type: 'SET_USER', payload: { preferredSubjects } });
  const addXP = (amount: number) => dispatch({ type: 'SET_USER', payload: { xp: state.xp + amount } });
  const addTokens = (amount: number) => dispatch({ type: 'SET_USER', payload: { tokens: state.tokens + amount } });
  const useLife = () => dispatch({ type: 'SET_USER', payload: { lives: Math.max(0, state.lives - 1) } });
  const resetLives = () => dispatch({ type: 'SET_USER', payload: { lives: 3 } });
  const addCompletedQuiz = (subjectId: SubjectId, quizId: QuizId) =>
    dispatch({ type: 'ADD_COMPLETED_QUIZ', payload: { subjectId, quizId } });
  const dailyReset = () => dispatch({ type: 'DAILY_RESET', order: DAILY_ORDER });
  const dailyDone = (subjectId: SubjectId) => dispatch({ type: 'DAILY_DONE', subjectId });

  return {
    ...state,
    hydrated,
    setName,
    setGrade,
    setLevel,
    setPreferredSubjects,
    addXP,
    addTokens,
    useLife,
    resetLives,
    soundOn,
    toggleSound,
    addCompletedQuiz,
    dailyReset,
    dailyDone,
    dispatch,
  };
}; 