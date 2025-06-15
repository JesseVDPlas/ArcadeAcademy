import { QuizProvider } from '@/contexts/QuizContext';
import { UserProvider } from '@/contexts/UserContext';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootNavigation() {
  const [fontsLoaded] = useFonts({
    ArcadeFont: require('@/assets/fonts/PressStart2P-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <UserProvider>
      <QuizProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </QuizProvider>
    </UserProvider>
  );
} 