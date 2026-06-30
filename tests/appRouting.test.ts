import {
  canAccessProtectedRoute,
  getInitialRoute,
  isOnboardingPath,
  isProtectedPath,
} from '@/lib/appRouting';

describe('appRouting', () => {
  describe('getInitialRoute', () => {
    it('returns null while hydration is pending', () => {
      expect(
        getInitialRoute({
          hydrated: false,
          name: null,
          grade: null,
          level: null,
        })
      ).toBeNull();
    });

    it('routes incomplete onboarding users to intro', () => {
      expect(
        getInitialRoute({
          hydrated: true,
          name: 'Jesse',
          grade: '2',
          level: '',
        })
      ).toBe('/onboarding/intro');
    });

    it('routes complete onboarding users to home', () => {
      expect(
        getInitialRoute({
          hydrated: true,
          name: 'Jesse',
          grade: '2',
          level: 'HAVO',
        })
      ).toBe('/(tabs)/home');
    });
  });

  describe('canAccessProtectedRoute', () => {
    it('returns false when onboarding is incomplete', () => {
      expect(canAccessProtectedRoute({ completed: false })).toBe(false);
    });

    it('returns true when onboarding is complete', () => {
      expect(canAccessProtectedRoute({ completed: true })).toBe(true);
    });
  });

  describe('path classification', () => {
    it('detects protected runtime routes', () => {
      expect(isProtectedPath('/home')).toBe(true);
      expect(isProtectedPath('/quiz-screen')).toBe(true);
      expect(isProtectedPath('/shop/index')).toBe(true);
    });

    it('does not classify onboarding/start as protected', () => {
      expect(isProtectedPath('/start')).toBe(false);
      expect(isProtectedPath('/onboarding/intro')).toBe(false);
    });

    it('detects onboarding/start routes', () => {
      expect(isOnboardingPath('/start')).toBe(true);
      expect(isOnboardingPath('/onboarding/intro')).toBe(true);
      expect(isOnboardingPath('/home')).toBe(false);
    });
  });
});
