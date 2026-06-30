import { Stack } from 'expo-router';
import React from 'react';

const OnboardingLayout = () => (
  <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="intro" options={{ title: 'Intro' }} />
    <Stack.Screen name="name" options={{ title: 'Naam' }} />
    <Stack.Screen name="level" options={{ title: 'Niveau' }} />
    <Stack.Screen name="grade" options={{ title: 'Klas' }} />
    <Stack.Screen name="goal" options={{ title: 'Doel' }} />
    <Stack.Screen name="review" options={{ title: 'Review', presentation: 'transparentModal' }} />
    <Stack.Screen name="summary" options={{ title: 'Summary', presentation: 'transparentModal' }} />
  </Stack>
);

export default OnboardingLayout; 
