import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function OnboardingIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/onboarding/intro');
  }, [router]);
  return null;
} 