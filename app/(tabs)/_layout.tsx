import ErrorBoundary from '@/components/shared/ErrorBoundary';
import Icon from '@/app/components/ui/Icon';
import { Icon as MaterialIcon, tabIcons } from '@/lib/icons';
import { flags } from '@/lib/flags';
import { colors, fonts } from '@/theme';
import { Tabs } from 'expo-router';
import React from 'react';

const TabsLayout = () => {
  const showNonMvpTabs = flags.show_non_mvp_tabs;

  return (
    <ErrorBoundary>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.neon,
          tabBarInactiveTintColor: colors.grey[500],
          tabBarStyle: {
            backgroundColor: colors.dark,
            borderTopWidth: 0,
            height: 56,
          },
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: fonts.body,
          },
        }}
      >
        <Tabs.Screen
          name="home/index"
          options={{
            title: 'Home',
            tabBarIcon: () => <Icon name="play" />,
          }}
        />
        <Tabs.Screen
          name="quests/index"
          options={{
            href: showNonMvpTabs ? undefined : null,
            title: 'Quests',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcon name={tabIcons.quests} color={color} size={size || 24} />
            ),
          }}
        />
        <Tabs.Screen
          name="leaderboard/index"
          options={{
            href: showNonMvpTabs ? undefined : null,
            title: 'Leaderboard',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcon name={tabIcons.leaderboard} color={color} size={size || 24} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            href: showNonMvpTabs ? undefined : null,
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <MaterialIcon name={tabIcons.profile} color={color} size={size || 24} />
            ),
          }}
        />
        <Tabs.Screen
          name="shop/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="challenges/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="circles/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="quiz/index"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="quiz/[subject]"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
};

export default TabsLayout; 
