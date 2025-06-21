import { colors, fonts } from '@/theme';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
export default () => (
  <Tabs
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: colors.neon,
      tabBarInactiveTintColor: '#fff',
      tabBarStyle: { backgroundColor: colors.dark, borderTopWidth: 0 },
      tabBarLabelStyle: { fontFamily: fonts.arcade, fontSize: 12 },
    }}
  >
    <Tabs.Screen name="home/index"   options={{ title: 'Home',   tabBarIcon: () => <Text style={{ fontFamily: fonts.arcade, color: colors.neon }}>🏠</Text> }} />
    <Tabs.Screen name="quiz/index"   options={{ title: 'Quiz',   tabBarIcon: () => <Text style={{ fontFamily: fonts.arcade, color: colors.neon }}>❓</Text> }} />
    <Tabs.Screen name="rewards/index" options={{ title: 'Rewards', tabBarIcon: () => <Text style={{ fontFamily: fonts.arcade, color: colors.neon }}>⭐</Text> }} />
    <Tabs.Screen name="profile/index" options={{ title: 'Profiel', tabBarIcon: () => <Text style={{ fontFamily: fonts.arcade, color: colors.neon }}>👤</Text> }} />
  </Tabs>
); 