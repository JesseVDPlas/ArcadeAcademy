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
}

// ──────────────────────────────────────────────
// 📌 Initial state
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
};

// ──────────────────────────────────────────────
// 📌 Actions
type Action =
  | { type: 'SET_USER'; payload: Partial<UserState> }
  | { type: 'INTRO_DONE'; subject: SubjectId };

function reducer(state: UserState, action: Action): UserState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, ...action.payload };

    case 'INTRO_DONE': {
      const core = { ...state.progress.core, [action.subject]: 'done' } as CoreProgress;
      const subjectsUnlocked = Object.values(core).every(s => s === 'done');
      return { ...state, progress: { ...state.progress, core }, subjectsUnlocked };
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
  const useLife = () => dispatch({ type: 'SET_USER', payload: { lives: Math.max(0, state.lives - 1) } });
  const resetLives = () => dispatch({ type: 'SET_USER', payload: { lives: 3 } });

  return {
    ...state,
    hydrated,
    setName,
    setGrade,
    setLevel,
    setPreferredSubjects,
    addXP,
    useLife,
    resetLives,
    soundOn,
    toggleSound,
    dispatch,
  };
}; 