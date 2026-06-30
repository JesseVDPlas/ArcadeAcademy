export interface OnboardingStateLike {
  name?: string | null;
  grade?: string | null;
  level?: string | null;
}

export function isOnboardingComplete(user: OnboardingStateLike): boolean {
  return Boolean(
    user.name?.trim() &&
    user.grade?.trim() &&
    user.level?.trim()
  );
}

