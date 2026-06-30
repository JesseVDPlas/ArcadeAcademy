import { isOnboardingComplete, type OnboardingStateLike } from '@/lib/onboarding';

export type AppInitialRoute = '/(tabs)/home' | '/onboarding/intro';

export interface InitialRouteInput extends OnboardingStateLike {
  hydrated: boolean;
}

const PROTECTED_PREFIXES = [
  '/home',
  '/rewards',
  '/settings',
  '/shop',
  '/profile',
  '/quests',
  '/leaderboard',
  '/circles',
  '/challenges',
  '/quiz',
  '/quiz-screen',
  '/result-screen',
  '/(tabs)',
];

export function getInitialRoute(input: InitialRouteInput): AppInitialRoute | null {
  if (!input.hydrated) return null;
  const completed = isOnboardingComplete(input);
  return completed ? '/(tabs)/home' : '/onboarding/intro';
}

export function canAccessProtectedRoute(input: { completed: boolean }): boolean {
  return input.completed;
}

export function isProtectedPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return PROTECTED_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function isOnboardingPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  return pathname === '/start' || pathname === '/onboarding' || pathname.startsWith('/onboarding/');
}
