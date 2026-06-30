import HUD from '@/components/hud/HUD';
import Screen from '@/components/layout/Screen';
import RetroButton from '@/components/shared/RetroButton';
import Body from '@/components/ui/Body';
import { flags } from '@/lib/flags';
import { getEventBufferSnapshot } from '@/lib/analytics';
import {
  computeCompletionRateByPack,
  computeD1Retention,
  computeFunnelMetrics,
  computeOverallCompletionRate,
} from '@/lib/kpiDashboard';
import { colors, fonts, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const DebugMetricsScreen = () => {
  const router = useRouter();
  const isAllowed = __DEV__ || flags.show_debug_metrics;

  const events = useMemo(() => getEventBufferSnapshot(), []);
  const funnel = useMemo(() => computeFunnelMetrics(events as any), [events]);
  const completionByPack = useMemo(() => computeCompletionRateByPack(events as any), [events]);
  const completionOverall = useMemo(() => computeOverallCompletionRate(events as any), [events]);
  const d1 = useMemo(() => computeD1Retention(events as any), [events]);

  useEffect(() => {
    if (!isAllowed) {
      router.replace('/(tabs)/home');
    }
  }, [isAllowed, router]);

  if (!isAllowed) return null;

  return (
    <Screen header={<HUD compact />} padding="m">
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>DEBUG METRICS</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Funnel</Text>
          <Body style={styles.metric}>Home taps: {funnel.homePlayTaps}</Body>
          <Body style={styles.metric}>Quiz starts: {funnel.quizStarts}</Body>
          <Body style={styles.metric}>Quiz finishes: {funnel.quizFinishes}</Body>
          <Body style={styles.metric}>Quiz completes: {funnel.quizCompletes}</Body>
          <Body style={styles.metric}>Home→Start: {(funnel.homeToStartRate * 100).toFixed(1)}%</Body>
          <Body style={styles.metric}>Start→Finish: {(funnel.startToFinishRate * 100).toFixed(1)}%</Body>
          <Body style={styles.metric}>Start→Complete: {(funnel.startToCompleteRate * 100).toFixed(1)}%</Body>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Completion</Text>
          <Body style={styles.metric}>Starts: {completionOverall.starts}</Body>
          <Body style={styles.metric}>Completes: {completionOverall.completes}</Body>
          <Body style={styles.metric}>
            Completion rate: {(completionOverall.completionRate * 100).toFixed(1)}%
          </Body>
          {Object.entries(completionByPack).map(([packId, rate]) => (
            <Body key={packId} style={styles.metric}>
              {packId}: {(rate * 100).toFixed(1)}%
            </Body>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>D1 Indicator</Text>
          <Body style={styles.metric}>Cohort users: {d1.cohortUsers}</Body>
          <Body style={styles.metric}>Retained users: {d1.retainedUsers}</Body>
          <Body style={styles.metric}>Retention: {(d1.retentionRate * 100).toFixed(1)}%</Body>
          <Body style={styles.metric}>Install-date tagged events: {d1.basedOnInstallDateUsers}</Body>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Events</Text>
          <Body style={styles.metric}>Buffered events: {events.length}</Body>
        </View>

        <RetroButton onPress={() => router.replace('/(tabs)/home')} variant="secondary">
          TERUG NAAR HOME
        </RetroButton>
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.m,
  },
  title: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.neonGreen,
    textAlign: 'center',
    marginBottom: spacing.s,
  },
  card: {
    borderWidth: 1,
    borderColor: `${colors.neonGreen}45`,
    borderRadius: 12,
    backgroundColor: colors.cardBg,
    padding: spacing.m,
    gap: spacing.xs,
  },
  cardTitle: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.electricPurple,
    marginBottom: spacing.xs,
  },
  metric: {
    color: colors.textPrimary,
    fontSize: 13,
  },
});

export default DebugMetricsScreen;
