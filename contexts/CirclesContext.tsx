import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { CircleId, CircleMeta, CircleState } from '@/types/circles';
import { verifyClientCircleId, slugifyCircleName } from '@/lib/security.circle';
import { logEvent } from '@/lib/analytics';

const STORAGE_KEY = 'circles';

// ──────────────────────────────────────────────
// 📌 Initial State
const initialState: CircleState = {
  myCircleId: null,
  circles: {},
};

// ──────────────────────────────────────────────
// 📌 Actions
type CirclesAction =
  | { type: 'SET_STATE'; payload: CircleState }
  | { type: 'CREATE_CIRCLE'; payload: { id: CircleId; name: string } }
  | { type: 'JOIN_CIRCLE'; payload: { id: CircleId; name?: string } }
  | { type: 'LEAVE_CIRCLE' };

export function circlesReducer(
  state: CircleState,
  action: CirclesAction
): CircleState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'CREATE_CIRCLE': {
      const { id, name } = action.payload;
      const now = new Date().toISOString();
      
      return {
        ...state,
        myCircleId: id,
        circles: {
          ...state.circles,
          [id]: {
            id,
            name,
            createdAt: now,
          },
        },
      };
    }

    case 'JOIN_CIRCLE': {
      const { id, name } = action.payload;
      const now = new Date().toISOString();
      
      // If circle doesn't exist, create minimal meta
      const circleMeta: CircleMeta = state.circles[id] || {
        id,
        name: name || `Circle ${id.slice(0, 4)}`,
        createdAt: now,
      };

      return {
        ...state,
        myCircleId: id,
        circles: {
          ...state.circles,
          [id]: circleMeta,
        },
      };
    }

    case 'LEAVE_CIRCLE':
      return {
        ...state,
        myCircleId: null,
        // Keep circles metadata (don't delete)
      };

    default:
      return state;
  }
}

// ──────────────────────────────────────────────
// 📌 Context
interface CirclesContextValue {
  state: CircleState;
  hydrated: boolean;
  createCircle: (name: string) => CircleId | null;
  joinCircle: (circleId: string) => boolean;
  leaveCircle: () => void;
  getMyCircle: () => CircleMeta | null;
}

const CirclesContext = createContext<CirclesContextValue | undefined>(undefined);

// ──────────────────────────────────────────────
// 📌 Provider
export const CirclesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(circlesReducer, initialState);
  const [hydrated, setHydrated] = React.useState(false);

  // Load from storage
  useEffect(() => {
    const load = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as CircleState;
          dispatch({ type: 'SET_STATE', payload: parsed });
        }
      } catch (error) {
        if (__DEV__) console.error('[Circles] Load error:', error);
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
        if (__DEV__) console.error('[Circles] Save error:', error);
      }
    };
    save();
  }, [state, hydrated]);

  // ──────────────────────────────────────────────
  // Actions
  const createCircle = React.useCallback((name: string): CircleId | null => {
    if (!name || !name.trim()) {
      return null;
    }

    const circleId = slugifyCircleName(name.trim());
    
    if (!verifyClientCircleId(circleId)) {
      if (__DEV__) console.warn('[Circles] Invalid generated ID:', circleId);
      return null;
    }

    dispatch({ type: 'CREATE_CIRCLE', payload: { id: circleId, name: name.trim() } });
    
    logEvent('circle_create', {
      circleId,
      name: name.trim(),
      ts: Date.now(),
    });

    return circleId;
  }, []);

  const joinCircle = React.useCallback((circleId: string): boolean => {
    if (!circleId || !circleId.trim()) {
      return false;
    }

    const trimmed = circleId.trim();

    if (!verifyClientCircleId(trimmed)) {
      if (__DEV__) console.warn('[Circles] Invalid circle ID:', trimmed);
      return false;
    }

    dispatch({ type: 'JOIN_CIRCLE', payload: { id: trimmed } });
    
    logEvent('circle_join', {
      circleId: trimmed,
      ts: Date.now(),
    });

    return true;
  }, []);

  const leaveCircle = React.useCallback(() => {
    if (!state.myCircleId) return;

    const circleId = state.myCircleId;
    dispatch({ type: 'LEAVE_CIRCLE' });
    
    logEvent('circle_leave', {
      circleId,
      ts: Date.now(),
    });
  }, [state.myCircleId]);

  const getMyCircle = React.useCallback((): CircleMeta | null => {
    if (!state.myCircleId) return null;
    return state.circles[state.myCircleId] || null;
  }, [state]);

  const contextValue = React.useMemo(
    () => ({
      state,
      hydrated,
      createCircle,
      joinCircle,
      leaveCircle,
      getMyCircle,
    }),
    [state, hydrated, createCircle, joinCircle, leaveCircle, getMyCircle]
  );

  return (
    <CirclesContext.Provider value={contextValue}>
      {children}
    </CirclesContext.Provider>
  );
};

// ──────────────────────────────────────────────
// 📌 Hook
export const useCircles = () => {
  const context = useContext(CirclesContext);
  if (!context) {
    throw new Error('useCircles must be used within a CirclesProvider');
  }
  return context;
};
