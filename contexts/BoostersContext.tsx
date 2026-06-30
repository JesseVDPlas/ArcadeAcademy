import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

const STORAGE_KEY = 'boosters';

// ──────────────────────────────────────────────
// 📌 Types
export interface BoosterBalances {
  fiftyFifty: number;
  skip: number;
  // extraTime?: number; // Reserved for future
}

export interface BoostersState {
  balances: BoosterBalances;
  active: {
    fiftyFiftyForQuestionId?: string;
  };
}

// ──────────────────────────────────────────────
// 📌 Initial State
const initialState: BoostersState = {
  balances: {
    fiftyFifty: 0,
    skip: 0,
  },
  active: {},
};

// ──────────────────────────────────────────────
// 📌 Actions
type BoostersAction =
  | { type: 'SET_STATE'; payload: BoostersState }
  | { type: 'ADD_BOOSTERS'; payload: { type: 'fiftyFifty' | 'skip'; count: number } }
  | { type: 'USE_FIFTY_FIFTY'; payload: { questionId: string } }
  | { type: 'USE_SKIP' }
  | { type: 'CLEAR_EPHEMERAL' };

export function boostersReducer(
  state: BoostersState,
  action: BoostersAction
): BoostersState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'ADD_BOOSTERS': {
      const { type, count } = action.payload;
      return {
        ...state,
        balances: {
          ...state.balances,
          [type === 'fiftyFifty' ? 'fiftyFifty' : 'skip']:
            state.balances[type === 'fiftyFifty' ? 'fiftyFifty' : 'skip'] + count,
        },
      };
    }

    case 'USE_FIFTY_FIFTY': {
      if (state.balances.fiftyFifty <= 0) {
        return state;
      }
      return {
        ...state,
        balances: {
          ...state.balances,
          fiftyFifty: state.balances.fiftyFifty - 1,
        },
        active: {
          ...state.active,
          fiftyFiftyForQuestionId: action.payload.questionId,
        },
      };
    }

    case 'USE_SKIP': {
      if (state.balances.skip <= 0) {
        return state;
      }
      return {
        ...state,
        balances: {
          ...state.balances,
          skip: state.balances.skip - 1,
        },
      };
    }

    case 'CLEAR_EPHEMERAL':
      return {
        ...state,
        active: {},
      };

    default:
      return state;
  }
}

// ──────────────────────────────────────────────
// 📌 Context
interface BoostersContextValue {
  state: BoostersState;
  hydrated: boolean;
  addBoosters: (type: 'fiftyFifty' | 'skip', count: number) => void;
  canUse: (type: 'fiftyFifty' | 'skip') => boolean;
  useFiftyFifty: (questionId: string, correctIndex: number, optionsLen: number) => { removed: number[] } | null;
  useSkip: () => 'ok' | 'insufficient';
  clearEphemeral: () => void;
}

const BoostersContext = createContext<BoostersContextValue | undefined>(undefined);

// ──────────────────────────────────────────────
// 📌 Provider
export const BoostersProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(boostersReducer, initialState);
  const [hydrated, setHydrated] = React.useState(false);

  // Load from storage
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as BoostersState;
          dispatch({ type: 'SET_STATE', payload: parsed });
        }
      } catch (error) {
        if (__DEV__) console.error('[Boosters] Load error:', error);
      } finally {
        setHydrated(true);
      }
    };
    load();
  }, []);

  // Persist to storage
  useEffect(() => {
    if (!hydrated) return;
    
    const save = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        if (__DEV__) console.error('[Boosters] Save error:', error);
      }
    };
    save();
  }, [state, hydrated]);

  // ──────────────────────────────────────────────
  // Actions
  const addBoosters = React.useCallback((type: 'fiftyFifty' | 'skip', count: number) => {
    dispatch({ type: 'ADD_BOOSTERS', payload: { type, count } });
  }, []);

  const canUse = React.useCallback((type: 'fiftyFifty' | 'skip'): boolean => {
    return state.balances[type] > 0;
  }, [state.balances]);

  const useFiftyFifty = React.useCallback((
    questionId: string,
    correctIndex: number,
    optionsLen: number
  ): { removed: number[] } | null => {
    if (state.balances.fiftyFifty <= 0) {
      return null;
    }

    // Find 2 wrong indices to remove (never remove correct)
    const wrongIndices: number[] = [];
    for (let i = 0; i < optionsLen; i++) {
      if (i !== correctIndex) {
        wrongIndices.push(i);
      }
    }

    // Shuffle and take 2
    const shuffled = wrongIndices.sort(() => Math.random() - 0.5);
    const removed = shuffled.slice(0, 2);

    dispatch({ type: 'USE_FIFTY_FIFTY', payload: { questionId } });

    return { removed };
  }, [state.balances.fiftyFifty]);

  const useSkip = React.useCallback((): 'ok' | 'insufficient' => {
    if (state.balances.skip <= 0) {
      return 'insufficient';
    }

    dispatch({ type: 'USE_SKIP' });
    return 'ok';
  }, [state.balances.skip]);

  const clearEphemeral = React.useCallback(() => {
    dispatch({ type: 'CLEAR_EPHEMERAL' });
  }, []);

  const contextValue = React.useMemo(
    () => ({
      state,
      hydrated,
      addBoosters,
      canUse,
      useFiftyFifty,
      useSkip,
      clearEphemeral,
    }),
    [state, hydrated, addBoosters, canUse, useFiftyFifty, useSkip, clearEphemeral]
  );

  return (
    <BoostersContext.Provider value={contextValue}>
      {children}
    </BoostersContext.Provider>
  );
};

// ──────────────────────────────────────────────
// 📌 Hook
export const useBoosters = () => {
  const context = useContext(BoostersContext);
  if (!context) {
    throw new Error('useBoosters must be used within a BoostersProvider');
  }
  return context;
};
