import { useUser } from '@/contexts/UserContext';
import { getInitialRoute } from '@/lib/appRouting';
import { Redirect } from 'expo-router';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { hydrated, name, grade, level } = useUser();
  const route = getInitialRoute({ hydrated, name, grade, level });

  if (!route) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#39FF14" />
      </View>
    );
  }

  return <Redirect href={route} />;
}
