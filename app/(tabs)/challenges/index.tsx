import { ChallengeCard } from '@/components/challenges/ChallengeCard';
import HUD from '@/components/hud/HUD';
import Screen from '@/components/layout/Screen';
import { Section } from '@/components/shared/Section';
import { useChallenges } from '@/contexts/ChallengesContext';
import { flags } from '@/lib/flags';
import { colors, fonts, spacing } from '@/theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ChallengesScreen = () => {
  const { getWeek, getState, claim, rolloverIfNeeded, getGraceChallenges, hydrated } = useChallenges();
  const [showRolloverBanner, setShowRolloverBanner] = useState(false);
  const [wasRolledOver, setWasRolledOver] = useState(false);

  useEffect(() => {
    if (hydrated) {
      const beforeRollover = getWeek().weekKey;
      rolloverIfNeeded();
      const afterRollover = getWeek().weekKey;
      if (beforeRollover !== afterRollover && !wasRolledOver) {
        setShowRolloverBanner(true);
        setWasRolledOver(true);
        setTimeout(() => setShowRolloverBanner(false), 5000);
      }
    }
  }, [hydrated, rolloverIfNeeded, wasRolledOver]);

  if (!flags.weekly_challenges) {
    return (
      <Screen header={<HUD compact />} padding="m">
        <Section title="Weekly Challenges">
          <Text style={styles.disabledText}>Weekly challenges are currently disabled.</Text>
        </Section>
      </Screen>
    );
  }

  const week = getWeek();
  const completedCount = Object.values(week.states).filter(s => s.status === 'completed' || s.status === 'claimed').length;
  const totalCount = week.defs.length;
  const graceChallenges = getGraceChallenges();

  const handleClaim = (id: string) => {
    claim(id as any);
  };

  return (
    <Screen header={<HUD compact />} padding="m" scroll>
      <View style={styles.container}>
        {showRolloverBanner && (
          <View style={styles.rolloverBanner}>
            <Text style={styles.rolloverText}>
              New week started — 3 new challenges unlocked 🎉
            </Text>
          </View>
        )}

        <Section title={`Weekly Challenges (${completedCount}/${totalCount})`}>
          <Text style={styles.weekLabel}>Week: {week.weekKey}</Text>
        </Section>

        {graceChallenges.length > 0 && (
          <Section title="Last Week Rewards">
            <Text style={styles.graceText}>
              You have {graceChallenges.length} unclaimed reward{graceChallenges.length > 1 ? 's' : ''} from last week
            </Text>
            <View style={styles.challengesList}>
              {graceChallenges.map(id => {
                const def = week.defs.find(d => d.id === id);
                if (!def) return null;
                const state = getState(id);
                return (
                  <ChallengeCard
                    key={id}
                    def={def}
                    state={state}
                    onClaim={() => handleClaim(id)}
                    loading={false}
                  />
                );
              })}
            </View>
          </Section>
        )}

        <Section title="This Week">
          <View style={styles.challengesList}>
            {week.defs.map(def => {
              const state = getState(def.id);
              return (
                <ChallengeCard
                  key={def.id}
                  def={def}
                  state={state}
                  onClaim={() => handleClaim(def.id)}
                  loading={!hydrated}
                />
              );
            })}
          </View>
        </Section>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.l,
  },
  disabledText: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.grey[600],
    textAlign: 'center',
    padding: spacing.m,
  },
  rolloverBanner: {
    backgroundColor: colors.neon + '20',
    borderWidth: 1,
    borderColor: colors.neon,
    borderRadius: spacing.xs,
    padding: spacing.m,
    marginBottom: spacing.s,
  },
  rolloverText: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.neon,
    textAlign: 'center',
  },
  weekLabel: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.grey[600],
    marginTop: spacing.xs,
  },
  graceText: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.grey[600],
    marginBottom: spacing.s,
  },
  challengesList: {
    gap: spacing.m,
  },
});

export default ChallengesScreen;

