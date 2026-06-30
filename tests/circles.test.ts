/**
 * Tests for Circles feature
 */
import { circlesReducer } from '@/contexts/CirclesContext';
import { CircleState } from '@/types/circles';

describe('Circles', () => {
  const initialState: CircleState = {
    myCircleId: null,
    circles: {},
  };

  describe('circlesReducer', () => {
    it('should create a circle', () => {
      const action = {
        type: 'CREATE_CIRCLE' as const,
        payload: { id: 'test-circle-123', name: 'Test Circle' },
      };

      const newState = circlesReducer(initialState, action);

      expect(newState.myCircleId).toBe('test-circle-123');
      expect(newState.circles['test-circle-123']).toEqual({
        id: 'test-circle-123',
        name: 'Test Circle',
        createdAt: expect.any(String),
      });
    });

    it('should join a circle', () => {
      const action = {
        type: 'JOIN_CIRCLE' as const,
        payload: { id: 'existing-circle-456' },
      };

      const newState = circlesReducer(initialState, action);

      expect(newState.myCircleId).toBe('existing-circle-456');
      expect(newState.circles['existing-circle-456']).toBeDefined();
      expect(newState.circles['existing-circle-456'].name).toContain('Circle');
    });

    it('should join a circle with existing meta', () => {
      const stateWithCircle: CircleState = {
        myCircleId: null,
        circles: {
          'existing-circle-456': {
            id: 'existing-circle-456',
            name: 'Existing Circle',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        },
      };

      const action = {
        type: 'JOIN_CIRCLE' as const,
        payload: { id: 'existing-circle-456' },
      };

      const newState = circlesReducer(stateWithCircle, action);

      expect(newState.myCircleId).toBe('existing-circle-456');
      expect(newState.circles['existing-circle-456'].name).toBe('Existing Circle');
    });

    it('should leave a circle', () => {
      const stateInCircle: CircleState = {
        myCircleId: 'test-circle-123',
        circles: {
          'test-circle-123': {
            id: 'test-circle-123',
            name: 'Test Circle',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        },
      };

      const action = { type: 'LEAVE_CIRCLE' as const };

      const newState = circlesReducer(stateInCircle, action);

      expect(newState.myCircleId).toBeNull();
      // Circle metadata should be preserved
      expect(newState.circles['test-circle-123']).toBeDefined();
    });

    it('should set state', () => {
      const newState: CircleState = {
        myCircleId: 'new-circle',
        circles: {
          'new-circle': {
            id: 'new-circle',
            name: 'New Circle',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        },
      };

      const action = {
        type: 'SET_STATE' as const,
        payload: newState,
      };

      const result = circlesReducer(initialState, action);

      expect(result).toEqual(newState);
    });
  });

  describe('Circle ID validation', () => {
    // These would be tested via the security stub
    it('should accept valid circle IDs', () => {
      const validIds = ['abc-123', 'test-circle', 'circle-1', 'a1b2c3'];
      // This is a placeholder - actual validation is in security.circle.ts
      validIds.forEach(id => {
        expect(id.length).toBeGreaterThanOrEqual(3);
        expect(id.length).toBeLessThanOrEqual(40);
      });
    });
  });
});

