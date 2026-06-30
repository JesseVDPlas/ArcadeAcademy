import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { weeklyCatalog } from '@/lib/challenges.catalog';
import { isoWeekKey } from '@/lib/time';
import { logEvent } from '@/lib/analytics';
import { useTokens } from '@/contexts/TokenContext';
import {
  ChallengeId,
  ChallengeMetric,
  ChallengeState,
  ChallengeStatus,
  WeeklyChallenges,
} from '@/types/challenges';

// ──────────────────────────────────────────────
// 📌 Initial State Factory
function createInitialState(weekKey: string): WeeklyChallenges {
  const states: Record<ChallengeId, ChallengeState> = {} as Record<ChallengeId, ChallengeState>;
  
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

// ──────────────────────────────────────────────
// 📌 Actions
type ChallengesAction =
  | { type: 'SET_STATE'; payload: WeeklyChallenges }
  | { type: 'INCREMENT'; payload: { metric: ChallengeMetric; amount: number } }
  | { type: 'CLAIM'; payload: { id: ChallengeId } }
  | { type: 'ROLLOVER'; payload: { weekKey: string } }
  | { type: 'CLEAR_GRACE' };

export function challengesReducer(
  state: WeeklyChallenges,
  action: ChallengesAction
): WeeklyChallenges {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'ROLLOVER': {
      const { weekKey } = action.payload;
      const archived = [...(state.archived || [])];
      
      // Archive current week summary
      const summary = Object.values(state.states).map(s => ({
        id: s.id,
        status: s.status,
        progress: s.progress,
      }));
      
      archived.push({
        weekKey: state.weekKey,
        summary,
      });

      // Grace period: move completed but unclaimed challenges
      const unclaimed: ChallengeId[] = [];
      Object.values(state.states).forEach(s => {
        if (s.status === 'completed') {
          unclaimed.push(s.id);
        }
      });

      const grace = unclaimed.length > 0
        ? {
            weekKey: state.weekKey,
            unclaimed,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          }
        : undefined;

      // Create fresh state for new week
      const newState = createInitialState(weekKey);
      return {
        ...newState,
        archived,
        grace,
      };
    }

    case 'INCREMENT': {
      const { metric, amount } = action.payload;
      const newStates = { ...state.states };

      // Update all challenges with matching metric
      state.defs.forEach(def => {
        if (def.metric === metric) {
          const current = newStates[def.id];
          const newProgress = Math.min(current.progress + amount, def.target);
          const newStatus: ChallengeStatus =
            newProgress >= def.target ? 'completed' : current.status;

          newStates[def.id] = {
            ...current,
            progress: newProgress,
            status: newStatus,
          };

          logEvent('challenge_progress', {
            weekKey: state.weekKey,
            metric,
            id: def.id,
            progress: newProgress,
            target: def.target,
          });
        }
      });

      return {
        ...state,
        states: newStates,
      };
    }

    case 'CLAIM': {
      const { id } = action.payload;
      const current = state.states[id];
      const isGraceClaim = state.grace?.unclaimed.includes(id);

      // Allow claim if completed OR if in grace period
      if (current.status !== 'completed' && !isGraceClaim) {
        if (__DEV__) console.warn('[Challenges] Cannot claim non-completed challenge');
        return state;
      }

      const newStates = {
        ...state.states,
        [id]: {
          ...current,
          status: 'claimed',
        },
      };

      // Remove from grace if it was a grace claim
      let newGrace = state.grace;
      if (isGraceClaim && newGrace) {
        newGrace = {
          ...newGrace,
          unclaimed: newGrace.unclaimed.filter(cid => cid !== id),
        };
        // Remove grace if empty
        if (newGrace.unclaimed.length === 0) {
          newGrace = undefined;
        }
      }

      logEvent('challenge_claim', {
        id,
        reward: current.reward,
        weekKey: state.weekKey,
        isGrace: isGraceClaim || false,
      });

      return {
        ...state,
        states: newStates,
        grace: newGrace,
      };
    }

    case 'CLEAR_GRACE': {
      return {
        ...state,
        grace: undefined,
      };
    }

    default:
      return state;
  }
}

// ──────────────────────────────────────────────
// 📌 Context
const ChallengesContext = createContext<{
  state: WeeklyChallenges;
  dispatch: React.Dispatch<ChallengesAction>;
  hydrated: boolean;
}>(null as any);

export const ChallengesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(challengesReducer, createInitialState(isoWeekKey()));
  const [hydrated, setHydrated] = React.useState(false);
  const mountedRef = React.useRef(false);

  // 🔄 Hydrate from AsyncStorage
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    let isCancelled = false;

    const loadChallenges = async () => {
      try {
        const str = await AsyncStorage.getItem('weekly_challenges');
        if (!isCancelled && str) {
          const parsed = JSON.parse(str) as WeeklyChallenges;
          const currentWeekKey = isoWeekKey();
          
          // Check if we need rollover
          if (parsed.weekKey !== currentWeekKey) {
            dispatch({ type: 'ROLLOVER', payload: { weekKey: currentWeekKey } });
          } else {
            dispatch({ type: 'SET_STATE', payload: parsed });
          }
        } else {
          // First time: initialize with current week
          const currentWeekKey = isoWeekKey();
          dispatch({ type: 'SET_STATE', payload: createInitialState(currentWeekKey) });
        }
      } catch (e) {
        if (__DEV__) console.error('[ChallengesContext] Storage error:', e);
        // Fallback to initial state
        const currentWeekKey = isoWeekKey();
        dispatch({ type: 'SET_STATE', payload: createInitialState(currentWeekKey) });
      } finally {
        if (!isCancelled) {
          setHydrated(true);
        }
      }
    };

    loadChallenges();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 💾 Persist on every change
  useEffect(() => {
    if (!hydrated) return;

    const timeoutId = setTimeout(() => {
      AsyncStorage.setItem('weekly_challenges', JSON.stringify(state)).catch(e => {
        if (__DEV__) console.error('[ChallengesContext] Save error:', e);
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [state, hydrated]);

  // 🔄 Check rollover on mount and periodically
  useEffect(() => {
    if (!hydrated) return;

    const checkRollover = () => {
      const currentWeekKey = isoWeekKey();
      if (state.weekKey !== currentWeekKey) {
        dispatch({ type: 'ROLLOVER', payload: { weekKey: currentWeekKey } });
      }
      
      // Check grace expiry
      if (state.grace && state.grace.expiresAt < Date.now()) {
        dispatch({ type: 'CLEAR_GRACE' });
      }
    };

    checkRollover();
    // Check every hour
    const interval = setInterval(checkRollover, 3600000);

    return () => clearInterval(interval);
  }, [hydrated, state.weekKey, state.grace]);

  const contextValue = React.useMemo(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated]
  );

  return (
    <ChallengesContext.Provider value={contextValue}>
      {children}
    </ChallengesContext.Provider>
  );
};

// ──────────────────────────────────────────────
// 📌 Hook
export const useChallenges = () => {
  const context = useContext(ChallengesContext);
  if (!context) throw new Error('useChallenges must be used within a ChallengesProvider');
  const { state, dispatch, hydrated } = context;
  const { earn } = useTokens();

  const getWeek = React.useCallback((): WeeklyChallenges => {
    return state;
  }, [state]);

  const getState = React.useCallback(
    (id: ChallengeId): ChallengeState => {
      return state.states[id];
    },
    [state.states]
  );

  const increment = React.useCallback(
    (metric: ChallengeMetric, amount: number = 1) => {
      dispatch({ type: 'INCREMENT', payload: { metric, amount } });
    },
    [dispatch]
  );

  const claim = React.useCallback(
    (id: ChallengeId) => {
      const challengeState = state.states[id];
      const isGraceClaim = state.grace?.unclaimed.includes(id);
      
      // Allow claim if completed OR if in grace period
      if (challengeState.status !== 'completed' && !isGraceClaim) {
        if (__DEV__) console.warn('[Challenges] Cannot claim non-completed challenge');
        return;
      }

      // Award tokens (use grace weekKey if grace claim)
      const weekKeyForReward = isGraceClaim ? state.grace!.weekKey : state.weekKey;
      earn(challengeState.reward, 'weekly_challenge', {
        id,
        weekKey: weekKeyForReward,
      });

      // Update status
      dispatch({ type: 'CLAIM', payload: { id } });
    },
    [state, dispatch, earn]
  );

  const rolloverIfNeeded = React.useCallback(() => {
    const currentWeekKey = isoWeekKey();
    if (state.weekKey !== currentWeekKey) {
      dispatch({ type: 'ROLLOVER', payload: { weekKey: currentWeekKey } });
    }
  }, [state.weekKey, dispatch]);

  const getGraceChallenges = React.useCallback((): ChallengeId[] => {
    if (!state.grace || state.grace.expiresAt < Date.now()) {
      return [];
    }
    return state.grace.unclaimed;
  }, [state.grace]);

  return React.useMemo(
    () => ({
      getWeek,
      getState,
      increment,
      claim,
      rolloverIfNeeded,
      getGraceChallenges,
      hydrated,
    }),
    [getWeek, getState, increment, claim, rolloverIfNeeded, getGraceChallenges, hydrated]
  );
};

