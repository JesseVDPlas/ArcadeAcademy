import { isOnboardingComplete } from '@/lib/onboarding';

describe('onboardingGate', () => {
  it('returns true when name, grade and level are present', () => {
    expect(
      isOnboardingComplete({
        name: 'Jesse',
        grade: '2',
        level: 'HAVO',
      })
    ).toBe(true);
  });

  it('returns false when one required field is missing', () => {
    expect(
      isOnboardingComplete({
        name: 'Jesse',
        grade: '2',
        level: '',
      })
    ).toBe(false);
  });

  it('trims whitespace and rejects blank strings', () => {
    expect(
      isOnboardingComplete({
        name: '  ',
        grade: '1',
        level: 'VWO',
      })
    ).toBe(false);
  });
});

