import { useUser } from '@/contexts/UserContext';
import { localQuizRepository } from '@/lib/content/localRepository';
import { initializeIdentity } from '@/lib/identity';
import { isOnboardingComplete } from '@/lib/onboarding';
import { canAccessProtectedRoute, isOnboardingPath, isProtectedPath } from '@/lib/appRouting';
import { Providers } from '@/providers';
import { fonts } from '@/theme';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen, usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import RetroToast from '@/components/ui/RetroToast';

SplashScreen.preventAutoHideAsync();

function Gate() {
  const { hydrated, name, grade, level } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [fontsLoaded, fontError] = useFonts({
    [fonts.arcade]: require('../assets/fonts/PressStart2P-Regular.ttf'),
  });
  const [isReady, setIsReady] = React.useState(false);

  // Hide splash when ready
  useEffect(() => {
    if (hydrated && (fontsLoaded || fontError) && !isReady) {
      setIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [hydrated, fontsLoaded, fontError, isReady]);

  // Guard protected routes for users without completed onboarding.
  useEffect(() => {
    const completed = isOnboardingComplete({ name, grade, level });
    if (!isReady) return;
    if (!canAccessProtectedRoute({ completed }) && !isOnboardingPath(pathname) && isProtectedPath(pathname)) {
      router.replace('/onboarding/intro');
    }
  }, [isReady, name, grade, level, pathname, router]);

  useEffect(() => {
    if (!hydrated) return;
    initializeIdentity().catch((error) => {
      if (__DEV__) {
        console.warn('[Identity] initialization failed', error);
      }
    });
    localQuizRepository.validateStartup().catch((error) => {
      if (__DEV__) {
        console.warn('[Content] startup validation failed', error);
      }
    });
  }, [hydrated]);

  // Show loading state
  if (!hydrated || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#00ff00" />
      </View>
    );
  }

  // Handle font error
  if (fontError && __DEV__) {
    console.error('[Gate] Font loading error:', fontError);
  }

  // Always render Slot - navigation happens via useEffect
  return (
    <>
      <Slot />
      <RetroToast />
    </>
  );
}

Gate.displayName = 'Gate';

export default function RootLayout() {
  useEffect(() => {
    if (__DEV__) {
      console.log('[App] mounted');
    }
  }, []);

  return (
    <Providers>
      <Gate />
    </Providers>
  );
}
