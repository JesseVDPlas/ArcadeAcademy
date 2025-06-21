import { QuizProvider } from '@/contexts/QuizContext';
import { UserProvider, useUser } from '@/contexts/UserContext';
import { fonts } from '@/theme';
import { useFonts } from 'expo-font';
import { Redirect, Slot, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

function Gate() {
  const { hydrated, name } = useUser();
  const [fontsLoaded, fontError] = useFonts({
    [fonts.arcade]: require('../assets/fonts/PressStart2P-Regular.ttf'),
  });

  useEffect(() => {
    if (hydrated && (fontsLoaded || fontError)) {
      SplashScreen.hideAsync();
    }
  }, [hydrated, fontsLoaded, fontError]);

  if (!hydrated || (!fontsLoaded && !fontError)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (fontError) {
    // We kunnen hier een foutmelding tonen
    console.error(fontError);
  }

  if (!name) return <Redirect href="/onboarding/name" />;

  // Alleen als alles ok is, de Slot renderen:
  return <Slot />;
}

export default function Root() {
  return (
    <UserProvider>
      <QuizProvider>
        <Gate />
      </QuizProvider>
    </UserProvider>
  );
}
