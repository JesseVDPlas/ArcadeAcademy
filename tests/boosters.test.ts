/**
 * Tests for boosters functionality
 */
import { boostersReducer, BoostersState } from '@/contexts/BoostersContext';

describe('Boosters', () => {
  const initialState: BoostersState = {
    balances: {
      fiftyFifty: 0,
      skip: 0,
    },
    active: {},
  };

  describe('boostersReducer', () => {
    it('should add boosters to balance', () => {
      const action = {
        type: 'ADD_BOOSTERS' as const,
        payload: { type: 'fiftyFifty' as const, count: 2 },
      };

      const newState = boostersReducer(initialState, action);

      expect(newState.balances.fiftyFifty).toBe(2);
      expect(newState.balances.skip).toBe(0);
    });

    it('should use fiftyFifty and decrement balance', () => {
      const stateWithBalance: BoostersState = {
        balances: { fiftyFifty: 1, skip: 0 },
        active: {},
      };

      const action = {
        type: 'USE_FIFTY_FIFTY' as const,
        payload: { questionId: 'q1' },
      };

      const newState = boostersReducer(stateWithBalance, action);

      expect(newState.balances.fiftyFifty).toBe(0);
      expect(newState.active.fiftyFiftyForQuestionId).toBe('q1');
    });

    it('should not use fiftyFifty if balance is 0', () => {
      const action = {
        type: 'USE_FIFTY_FIFTY' as const,
        payload: { questionId: 'q1' },
      };

      const newState = boostersReducer(initialState, action);

      expect(newState).toEqual(initialState); // No change
    });

    it('should use skip and decrement balance', () => {
      const stateWithBalance: BoostersState = {
        balances: { fiftyFifty: 0, skip: 1 },
        active: {},
      };

      const action = { type: 'USE_SKIP' as const };

      const newState = boostersReducer(stateWithBalance, action);

      expect(newState.balances.skip).toBe(0);
    });

    it('should not use skip if balance is 0', () => {
      const action = { type: 'USE_SKIP' as const };

      const newState = boostersReducer(initialState, action);

      expect(newState).toEqual(initialState); // No change
    });

    it('should clear ephemeral state', () => {
      const stateWithActive: BoostersState = {
        balances: { fiftyFifty: 0, skip: 0 },
        active: { fiftyFiftyForQuestionId: 'q1' },
      };

      const action = { type: 'CLEAR_EPHEMERAL' as const };

      const newState = boostersReducer(stateWithActive, action);

      expect(newState.active).toEqual({});
    });
  });

  describe('useFiftyFifty logic', () => {
    // These would be integration tests with the actual hook
    // For now, we test the reducer behavior
    it('should track active fiftyFifty per question', () => {
      const state: BoostersState = {
        balances: { fiftyFifty: 1, skip: 0 },
        active: {},
      };

      const action = {
        type: 'USE_FIFTY_FIFTY' as const,
        payload: { questionId: 'q1' },
      };

      const newState = boostersReducer(state, action);

      expect(newState.active.fiftyFiftyForQuestionId).toBe('q1');
    });
  });
});

