import { UserProvider } from '@/contexts/UserContext';
import RootNavigation from '@/navigation/RootNavigation';
import React from 'react';

const isStorybook = process.env.EXPO_TARGET === 'storybook';

const RootComponent = isStorybook
  ? require('../.storybook').default
  : RootNavigation;

export default function AppRoot() {
  return (
    <UserProvider>
      <RootComponent />
    </UserProvider>
  );
}
