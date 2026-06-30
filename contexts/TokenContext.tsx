import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { flags } from '@/lib/flags';
import { verifyClientTokenEvent } from '@/lib/security';
import { logEvent } from '@/lib/analytics';

// ──────────────────────────────────────────────
// 📌 Types
export type TokenReasonEarn = 'quiz_complete' | 'accuracy_bonus' | 'streak_bonus' | 'weekly_challenge';
export type TokenReasonSpend = 'extra_life_pack' | 'streak_protection' | 'bitbyte_cosmetic' | 'profile_theme' | 'hint';

export type TokenEvent =
  | { type: 'EARN'; reason: TokenReasonEarn; amount: number; meta?: Record<string, any>; ts: number }
  | { type: 'SPEND'; reason: TokenReasonSpend; amount: number; meta?: Record<string, any>; ts: number };

export interface TokenState {
  balance: number;
  history: TokenEvent[];
  earnLimits?: {
    [dayKey: string]: {
      [reason: string]: number; // count per reason per day
    };
  };
}

// ──────────────────────────────────────────────
// 📌 Initial State
const initialState: TokenState = {
  balance: 0,
  history: [],
  earnLimits: {},
};

// Rate limit config
const EARN_LIMITS: Record<string, number> = {
  quiz_complete: 20,
};

// ──────────────────────────────────────────────
// 📌 Actions
type TokenAction =
  | { type: 'SET_STATE'; payload: TokenState }
  | { type: 'EARN'; payload: TokenEvent }
  | { type: 'SPEND'; payload: TokenEvent };

export function tokenReducer(state: TokenState, action: TokenAction): TokenState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'EARN': {
      const event = action.payload;
      // Security check
      if (flags.token_security_on && !verifyClientTokenEvent(event)) {
        if (__DEV__) console.warn('[TokenContext] Security check failed for EARN event');
        return state;
      }
      
      // Rate limiting
      if (flags.earn_limits && EARN_LIMITS[event.reason]) {
        const dayKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const limits = state.earnLimits || {};
        const dayLimits = limits[dayKey] || {};
        const count = (dayLimits[event.reason] || 0) + 1;
        const maxCount = EARN_LIMITS[event.reason];
        
        if (count > maxCount) {
          logEvent('earn_blocked', { reason: event.reason, dayKey, count });
          if (__DEV__) console.warn(`[TokenContext] Rate limit exceeded for ${event.reason}: ${count}/${maxCount}`);
          return state; // Block the earn
        }
        
        // Update limits
        const newLimits = {
          ...limits,
          [dayKey]: {
            ...dayLimits,
            [event.reason]: count,
          },
        };
        
        return {
          balance: state.balance + event.amount,
          history: [...state.history, event],
          earnLimits: newLimits,
        };
      }
      
      return {
        balance: state.balance + event.amount,
        history: [...state.history, event],
        earnLimits: state.earnLimits,
      };
    }

    case 'SPEND': {
      const event = action.payload;
      // Security check
      if (flags.token_security_on && !verifyClientTokenEvent(event)) {
        if (__DEV__) console.warn('[TokenContext] Security check failed for SPEND event');
        return state;
      }
      // Balance check
      if (state.balance < event.amount) {
        throw new Error(`Insufficient tokens. Required: ${event.amount}, Available: ${state.balance}`);
      }
      return {
        balance: state.balance - event.amount,
        history: [...state.history, event],
      };
    }

    default:
      return state;
  }
}

// ──────────────────────────────────────────────
// 📌 Context
const TokenContext = createContext<{
  state: TokenState;
  dispatch: React.Dispatch<TokenAction>;
  hydrated: boolean;
}>(null as any);

export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tokenReducer, initialState);
  const [hydrated, setHydrated] = React.useState(false);
  const mountedRef = React.useRef(false);

  // 🔄 Hydrate from AsyncStorage
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    let isCancelled = false;

    const loadTokens = async () => {
      try {
        const str = await AsyncStorage.getItem('tokens');
        if (!isCancelled && str) {
          const parsed = JSON.parse(str);
          dispatch({ type: 'SET_STATE', payload: parsed });
        }
      } catch (e) {
        if (__DEV__) console.error('[TokenContext] Storage error:', e);
      } finally {
        if (!isCancelled) {
          setHydrated(true);
        }
      }
    };

    loadTokens();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 💾 Persist on every change
  useEffect(() => {
    if (!hydrated) return;

    const timeoutId = setTimeout(() => {
      AsyncStorage.setItem('tokens', JSON.stringify(state)).catch(e => {
        if (__DEV__) console.error('[TokenContext] Save error:', e);
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [state, hydrated]);

  const contextValue = React.useMemo(
    () => ({ state, dispatch, hydrated }),
    [state, hydrated]
  );

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  );
};

// ──────────────────────────────────────────────
// 📌 Hook
export const useTokens = () => {
  const context = useContext(TokenContext);
  if (!context) throw new Error('useTokens must be used within a TokenProvider');
  const { state, dispatch, hydrated } = context;

  const earn = React.useCallback(
    (amount: number, reason: TokenReasonEarn, meta?: Record<string, any>) => {
      const event: TokenEvent = {
        type: 'EARN',
        reason,
        amount,
        meta,
        ts: Date.now(),
      };
      dispatch({ type: 'EARN', payload: event });
    },
    [dispatch]
  );

  const spend = React.useCallback(
    (amount: number, reason: TokenReasonSpend, meta?: Record<string, any>) => {
      const event: TokenEvent = {
        type: 'SPEND',
        reason,
        amount,
        meta,
        ts: Date.now(),
      };
      dispatch({ type: 'SPEND', payload: event });
    },
    [dispatch]
  );

  const canAfford = React.useCallback(
    (amount: number): boolean => {
      return state.balance >= amount;
    },
    [state.balance]
  );

  const getRunDelta = React.useCallback(
    (sinceTs: number): { earned: number; spent: number; net: number } => {
      const events = state.history.filter(e => e.ts >= sinceTs);
      const earned = events
        .filter((e): e is Extract<TokenEvent, { type: 'EARN' }> => e.type === 'EARN')
        .reduce((sum, e) => sum + e.amount, 0);
      const spent = events
        .filter((e): e is Extract<TokenEvent, { type: 'SPEND' }> => e.type === 'SPEND')
        .reduce((sum, e) => sum + e.amount, 0);
      return {
        earned,
        spent,
        net: earned - spent,
      };
    },
    [state.history]
  );

  return React.useMemo(
    () => ({
      balance: state.balance,
      history: state.history,
      hydrated,
      earn,
      spend,
      canAfford,
      getRunDelta,
    }),
    [state.balance, state.history, hydrated, earn, spend, canAfford, getRunDelta]
  );
};

