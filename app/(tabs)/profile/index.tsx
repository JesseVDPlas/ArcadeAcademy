import HUD from '@/components/hud/HUD';
import Screen from '@/components/layout/Screen';
import { Section } from '@/components/shared/Section';
import { Icon, actionIcons } from '@/lib/icons';
import { flags } from '@/lib/flags';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts, spacing, radii } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

const ProfileScreen = () => {
  const router = useRouter();
  const { name, userLevel, streak, alias } = useUser();
  const streakCount = streak?.current || 0;

  useEffect(() => {
    if (!flags.show_non_mvp_tabs) {
      router.replace('/(tabs)/home');
    }
  }, [router]);

  if (!flags.show_non_mvp_tabs) {
    return null;
  }

  const profileCards = [
    {
      id: 'achievements',
      title: 'Achievements',
      icon: 'star-four-points-outline',
      onPress: () => {
        // Placeholder - can route to achievements screen later
        router.push('/(tabs)/profile/achievements');
      },
    },
    {
      id: 'inventory',
      title: 'Inventory / Shop',
      icon: actionIcons.shop,
      onPress: () => {
        router.push('/(tabs)/shop');
      },
    },
    ...(flags.circles
      ? [
          {
            id: 'friends',
            title: 'Friends / Circle',
            icon: 'account-group',
            onPress: () => {
              router.push('/(tabs)/circles');
            },
          },
        ]
      : []),
  ];

  return (
    <Screen header={<HUD compact />} padding="m" scroll>
      {/* Profile Card */}
      <Section title="Profile">
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarPlaceholder}>
              <Icon name="account-circle" size={48} color={colors.neonGreen} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{name || 'Player'}</Text>
              {alias && <Text style={styles.profileAlias}>@{alias}</Text>}
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Level</Text>
              <Text style={styles.statValue}>Lv {userLevel}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Streak</Text>
              <Text style={styles.statValue}>🔥 {streakCount}</Text>
            </View>
          </View>
        </View>
      </Section>

      {/* Cards */}
      <Section title="Menu">
        <View style={styles.cardsContainer}>
          {profileCards.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={styles.card}
              onPress={card.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <Icon name={card.icon as any} size={24} color={colors.neonGreen} />
                <Text style={styles.cardText}>{card.title}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.grey[600]} />
            </TouchableOpacity>
          ))}
        </View>
      </Section>
    </Screen>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.m,
    borderWidth: 2,
    borderColor: colors.neonGreen + '40',
    padding: spacing.m,
    gap: spacing.m,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.neonGreen,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  profileName: {
    fontFamily: fonts.arcade, // Keep arcade for name (title-like)
    fontSize: 16,
    color: colors.white,
  },
  profileAlias: {
    fontFamily: fonts.body, // System font for alias (body text)
    fontSize: 12,
    color: colors.grey[500],
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.l,
    paddingTop: spacing.m,
    borderTopWidth: 1,
    borderTopColor: colors.grey[700],
  },
  statItem: {
    gap: spacing.xs,
  },
  statLabel: {
    fontFamily: fonts.body, // System font for labels
    fontSize: 10,
    color: colors.grey[500],
  },
  statValue: {
    fontFamily: fonts.arcade, // Keep arcade for values (button-like)
    fontSize: 14,
    color: colors.neonGreen,
  },
  cardsContainer: {
    gap: spacing.s,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderRadius: radii.m,
    borderWidth: 2,
    borderColor: colors.neonGreen + '40',
    padding: spacing.m,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  cardText: {
    fontFamily: fonts.body, // System font for body text
    fontSize: 14,
    color: colors.white,
  },
});

export default ProfileScreen;
