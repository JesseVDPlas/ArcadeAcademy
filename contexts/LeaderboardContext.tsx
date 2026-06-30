import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer, useMemo } from 'react';
import { useTokens, TokenEvent } from '@/contexts/TokenContext';
import { useCircles } from '@/contexts/CirclesContext';
import { isoWeekKey, isoMonthKey } from '@/lib/time';
import { logEvent } from '@/lib/analytics';
import { LeaderEntry, LeaderboardState } from '@/types/leaderboard';
import { CircleId } from '@/types/circles';

export type LeaderboardPeriod = 'weekly' | 'monthly' | 'all_time';

export interface PeriodRow {
  alias: string;
  tokens: number;
  ts: number; // earliest contributing event timestamp
}

// ──────────────────────────────────────────────
// 📌 Adapter Interface (for future backend)
export interface LeaderboardAdapter {
  submit(entry: LeaderEntry): Promise<void>;
  fetch(weekKey: string): Promise<LeaderEntry[]>;
}

export const localAdapter: LeaderboardAdapter = {
  submit: async () => {
    // Local-only: handled by context state
  },
  fetch: async () => {
    // Local-only: return empty, will be populated by local state
    return [];
  },
};

// ──────────────────────────────────────────────
// 📌 Initial State
function createInitialState(weekKey: string): LeaderboardState {
  return {
    weekKey,
    entries: [],
    alias: undefined,
    me: undefined,
    lastSubmitAt: undefined,
  };
}

// ──────────────────────────────────────────────
// 📌 Actions
type LeaderboardAction =
  | { type: 'SET_STATE'; payload: LeaderboardState }
  | { type: 'SET_ALIAS'; payload: { alias: string } }
  | { type: 'SUBMIT_ENTRY'; payload: { entry: LeaderEntry } }
  | { type: 'SET_ENTRIES'; payload: { entries: LeaderEntry[] } }
  | { type: 'ROLLOVER'; payload: { weekKey: string } };

export function leaderboardReducer(
  state: LeaderboardState,
  action: LeaderboardAction
): LeaderboardState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'SET_ALIAS':
      return {
        ...state,
        alias: action.payload.alias,
      };

    case 'SUBMIT_ENTRY': {
      const { entry } = action.payload;
      const existing = state.entries.filter(e => e.alias !== entry.alias);
      const updated = [...existing, entry];
      
      // Sort: tokens desc, then ts asc (earlier timestamp wins tiebreaker)
      updated.sort((a, b) => {
        if (b.tokens !== a.tokens) {
          return b.tokens - a.tokens;
        }
        return a.ts - b.ts;
      });

      // Find me
      const me = updated.find(e => e.alias === state.alias);

      return {
        ...state,
        entries: updated,
        me,
        lastSubmitAt: Date.now(),
      };
    }

    case 'SET_ENTRIES': {
      const entries = action.payload.entries;
      const me = entries.find(e => e.alias === state.alias);

      return {
        ...state,
        entries,
        me,
      };
    }

    case 'ROLLOVER': {
      return createInitialState(action.payload.weekKey);
    }

    default:
      return state;
  }
}

// ──────────────────────────────────────────────
// 📌 Context
const LeaderboardContext = createContext<{
  state: LeaderboardState;
  dispatch: React.Dispatch<LeaderboardAction>;
  hydrated: boolean;
}>(null as any);

export const LeaderboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(leaderboardReducer, createInitialState(isoWeekKey()));
  const [hydrated, setHydrated] = React.useState(false);
  const mountedRef = React.useRef(false);

  // 🔄 Hydrate from AsyncStorage
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    let isCancelled = false;

    const loadLeaderboard = async () => {
      try {
        const str = await AsyncStorage.getItem('leaderboard');
        if (!isCancelled && str) {
          const parsed = JSON.parse(str) as LeaderboardState;
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
        if (__DEV__) console.error('[LeaderboardContext] Storage error:', e);
        // Fallback to initial state
        const currentWeekKey = isoWeekKey();
        dispatch({ type: 'SET_STATE', payload: createInitialState(currentWeekKey) });
      } finally {
        if (!isCancelled) {
          setHydrated(true);
        }
      }
    };

    loadLeaderboard();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 💾 Persist on every change
  useEffect(() => {
    if (!hydrated) return;

    const timeoutId = setTimeout(() => {
      AsyncStorage.setItem('leaderboard', JSON.stringify(state)).catch(e => {
        if (__DEV__) console.error('[LeaderboardContext] Save error:', e);
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [state, hydrated]);

  // 🔄 Check rollover periodically
  useEffect(() => {
    if (!hydrated) return;

    const checkRollover = () => {
      const currentWeekKey = isoWeekKey();
      if (state.weekKey !== currentWeekKey) {
        dispatch({ type: 'ROLLOVER', payload: { weekKey: currentWeekKey } });
      }
    };

    checkRollover();
    // Check every hour
    const interval = setInterval(checkRollover, 3600000);

    return () => clearInterval(interval);
  }, [hydrated, state.weekKey]);

  const contextValue = React.useMemo(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated]
  );

  return (
    <LeaderboardContext.Provider value={contextValue}>
      {children}
    </LeaderboardContext.Provider>
  );
};

// ──────────────────────────────────────────────
// 📌 Hook
export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (!context) throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  const { state, dispatch, hydrated } = context;
  const { history } = useTokens();

  const validateAlias = React.useCallback((alias: string): { valid: boolean; error?: string } => {
    if (alias.length < 3) {
      return { valid: false, error: 'Alias must be at least 3 characters' };
    }
    if (alias.length > 16) {
      return { valid: false, error: 'Alias must be at most 16 characters' };
    }
    if (!/^[A-Za-z0-9_-]+$/.test(alias)) {
      return { valid: false, error: 'Alias can only contain letters, numbers, _ and -' };
    }
    return { valid: true };
  }, []);

  const setAlias = React.useCallback(
    (alias: string) => {
      const validation = validateAlias(alias);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      dispatch({ type: 'SET_ALIAS', payload: { alias } });
    },
    [dispatch, validateAlias]
  );

  const computeWeeklyTokens = React.useCallback((): number => {
    const currentWeekKey = isoWeekKey();
    const weekEvents = history.filter(e => {
      if (e.type !== 'EARN') return false;
      const meta = e.meta || {};
      return meta.weekKey === currentWeekKey;
    });

    return weekEvents.reduce((sum, e) => sum + e.amount, 0);
  }, [history]);

  const { state: circlesState } = useCircles();

  const submitWeekly = React.useCallback(async () => {
    if (!state.alias) {
      if (__DEV__) console.warn('[Leaderboard] Cannot submit without alias');
      return;
    }

    // Check cooldown (15 minutes)
    const COOLDOWN_MS = 15 * 60 * 1000;
    if (state.lastSubmitAt && Date.now() - state.lastSubmitAt < COOLDOWN_MS) {
      const remaining = Math.ceil((COOLDOWN_MS - (Date.now() - state.lastSubmitAt)) / 1000 / 60);
      throw new Error(`Please wait ${remaining} more minute${remaining > 1 ? 's' : ''} before resubmitting`);
    }

    const tokens = computeWeeklyTokens();
    const entry: LeaderEntry = {
      alias: state.alias,
      tokens,
      ts: Date.now(),
      // Include circleId if user is in a circle
      circleId: circlesState.myCircleId || undefined,
    };

    dispatch({ type: 'SUBMIT_ENTRY', payload: { entry } });
    
    logEvent('leaderboard_submit', { 
      weekKey: state.weekKey, 
      tokens, 
      alias: state.alias,
      circleId: circlesState.myCircleId || undefined,
    });
  }, [state.alias, state.weekKey, state.lastSubmitAt, computeWeeklyTokens, circlesState.myCircleId, dispatch]);

  const fetchWeekly = React.useCallback(async (): Promise<LeaderEntry[]> => {
    // For local adapter, return current entries
    // Future: call adapter.fetch(weekKey)
    return state.entries;
  }, [state.entries]);

  const getBoard = React.useCallback((): LeaderboardState => {
    return state;
  }, [state]);

  const getCooldownRemaining = React.useCallback((): number | null => {
    if (!state.lastSubmitAt) return null;
    const COOLDOWN_MS = 15 * 60 * 1000;
    const elapsed = Date.now() - state.lastSubmitAt;
    if (elapsed >= COOLDOWN_MS) return null;
    return Math.ceil((COOLDOWN_MS - elapsed) / 1000 / 60); // minutes
  }, [state.lastSubmitAt]);

  /**
   * Get circle leaderboard for a specific circle and week
   * Filters entries by circleId and sorts by tokens (desc) then ts (asc)
   */
  const getCircleWeekBoard = React.useCallback((circleId: CircleId, weekKey: string): LeaderEntry[] => {
    // Only return entries for current week
    if (state.weekKey !== weekKey) {
      return [];
    }

    // Filter by circleId and sort
    const circleEntries = state.entries
      .filter(e => e.circleId === circleId)
      .sort((a, b) => {
        // Sort: tokens desc, then ts asc (earlier timestamp wins tiebreaker)
        if (b.tokens !== a.tokens) {
          return b.tokens - a.tokens;
        }
        return a.ts - b.ts;
      })
      .slice(0, 10); // Top 10

    return circleEntries;
  }, [state.entries, state.weekKey]);

  // Expose aggregate function for use in standalone hook
  const getAggregateFn = React.useCallback(() => {
    return (tokenHistory: TokenEvent[], period: LeaderboardPeriod, now: Date = new Date()): PeriodRow[] => {
      const weekKeyNow = isoWeekKey(now);
      const monthKeyNow = isoMonthKey(now);

      const map = new Map<string, { tokens: number; ts: number }>();

      for (const ev of tokenHistory) {
        if (ev.type !== 'EARN') continue; // only count earnings
        
        const ts = typeof ev.ts === 'number' ? ev.ts : new Date(ev.ts).getTime();
        const d = new Date(ts);

        const include =
          period === 'weekly' ? (isoWeekKey(d) === weekKeyNow) :
          period === 'monthly' ? (isoMonthKey(d) === monthKeyNow) :
          period === 'all_time' ? true :
          false;

        if (!include) continue;

        // Use alias from meta if available, otherwise default to current user's alias or 'You'
        const alias = ev.meta?.alias || state.alias || 'You';
        const curr = map.get(alias) ?? { tokens: 0, ts };
        const nextTs = Math.min(curr.ts, ts);
        map.set(alias, { tokens: curr.tokens + ev.amount, ts: nextTs });
      }

      // Convert to rows
      const rows: PeriodRow[] = [];
      for (const [alias, v] of map) {
        rows.push({ alias, tokens: v.tokens, ts: v.ts });
      }

      // Sort: tokens desc, then ts asc (earlier timestamp wins tiebreaker)
      rows.sort((a, b) => {
        if (b.tokens !== a.tokens) {
          return b.tokens - a.tokens;
        }
        return a.ts - b.ts;
      });

      return rows;
    };
  }, [state.alias]);

  return React.useMemo(
    () => ({
      setAlias,
      validateAlias,
      computeWeeklyTokens,
      submitWeekly,
      fetchWeekly,
      getBoard,
      getCooldownRemaining,
      getCircleWeekBoard,
      hydrated,
    }),
    [setAlias, validateAlias, computeWeeklyTokens, submitWeekly, fetchWeekly, getBoard, getCooldownRemaining, getCircleWeekBoard, hydrated]
  );
};

// ──────────────────────────────────────────────
// 📌 Standalone period aggregation function (for tests and hooks)
export function aggregateTokensByPeriod(
  tokenHistory: TokenEvent[],
  period: LeaderboardPeriod,
  alias: string | undefined,
  now: Date = new Date()
): PeriodRow[] {
  const weekKeyNow = isoWeekKey(now);
  const monthKeyNow = isoMonthKey(now);

  const map = new Map<string, { tokens: number; ts: number }>();

  for (const ev of tokenHistory) {
    if (ev.type !== 'EARN') continue; // only count earnings
    
    const ts = typeof ev.ts === 'number' ? ev.ts : new Date(ev.ts).getTime();
    const d = new Date(ts);

    const include =
      period === 'weekly' ? (isoWeekKey(d) === weekKeyNow) :
      period === 'monthly' ? (isoMonthKey(d) === monthKeyNow) :
      period === 'all_time' ? true :
      false;

    if (!include) continue;

    // Use alias from meta if available, otherwise default to provided alias or 'You'
    const eventAlias = ev.meta?.alias || alias || 'You';
    const curr = map.get(eventAlias) ?? { tokens: 0, ts };
    const nextTs = Math.min(curr.ts, ts);
    map.set(eventAlias, { tokens: curr.tokens + ev.amount, ts: nextTs });
  }

  // Convert to rows
  const rows: PeriodRow[] = [];
  for (const [eventAlias, v] of map) {
    rows.push({ alias: eventAlias, tokens: v.tokens, ts: v.ts });
  }

  // Sort: tokens desc, then ts asc (earlier timestamp wins tiebreaker)
  rows.sort((a, b) => {
    if (b.tokens !== a.tokens) {
      return b.tokens - a.tokens;
    }
    return a.ts - b.ts;
  });

  return rows;
}

// ──────────────────────────────────────────────
// 📌 Standalone hook for period data
export function useLeaderboardPeriod(period: LeaderboardPeriod): PeriodRow[] {
  const { history } = useTokens();
  const { getBoard } = useLeaderboard();
  const board = getBoard();
  
  return React.useMemo(() => {
    const safeHistory = history || [];
    return aggregateTokensByPeriod(safeHistory, period, board.alias);
  }, [history, period, board.alias]);
}

