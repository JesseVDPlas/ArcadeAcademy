import DailyChallengeMap from '@/components/home/DailyChallengeMap';
import { HomeQuickActions } from '@/components/home/HomeQuickActions';
import HUD from '@/components/hud/HUD';
import Screen from '@/components/layout/Screen';
import { Divider, Section } from '@/components/shared/Section';
import RetroButton from '@/components/shared/RetroButton';
import { ActionSheet, ActionSheetItem } from '@/components/ui/ActionSheet';
import BigPlayButton from '@/components/ui/BigPlayButton';
import BitByte from '@/components/ui/BitByte';
import Body from '@/components/ui/Body';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { DialogBox } from '@/components/ui/DialogBox';
import { FAB } from '@/components/ui/FAB';
import { actionIcons } from '@/lib/icons';
import { useChallenges } from '@/contexts/ChallengesContext';
import { useToast } from '@/contexts/ToastContext';
import { flags } from '@/lib/flags';
import { useUser } from '@/contexts/UserContext';
import { log, logOncePerSession } from '@/lib/analytics';
import { getIdentitySnapshot } from '@/lib/identity';
import { canStartQuiz, getNoLivesReason } from '@/lib/quizAccess';
import { resolveNextUp, formatNextUp } from '@/utils/nextUp';
import { colors, fonts, radii, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { trackTimeToPlay } from '@/lib/kpis';

const HomeScreen = () => {
  const router = useRouter();
  const { getWeek } = useChallenges();
  const { hydrated, dailyChallenge, subjectsUnlocked, lives } = useUser();
  const { show: showToast } = useToast();
  const [showTip, setShowTip] = useState(true);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const mountTimeRef = useRef<number | null>(null);
  
  const week = flags.weekly_challenges ? getWeek() : null;
  const completedCount = week
    ? Object.values(week.states).filter(s => s.status === 'completed' || s.status === 'claimed').length
    : 0;
  const totalCount = week ? week.defs.length : 0;

  // Track mount time for KPI
  useEffect(() => {
    if (!hydrated) return;
    const mountTime = Date.now();
    mountTimeRef.current = mountTime;
    trackTimeToPlay(mountTime);

    const identity = getIdentitySnapshot();
    const source: 'cold' | 'warm' =
      identity && mountTime - identity.sessionStartTs > 15000 ? 'warm' : 'cold';
    logOncePerSession('app_open', { source });
  }, [hydrated]);

  // Hydrate guard: don't render until state is ready
  if (!hydrated) {
    return null; // or return a loading skeleton
  }

  // Core Loop MVP: Resolve next up
  const nextUp = resolveNextUp({ dailyChallenge, subjectsUnlocked });
  const nextUpLabel = formatNextUp(nextUp);

  const startNextUp = () => {
    if (!canStartQuiz(lives)) {
      log('quiz_start_blocked_no_lives', { entry: 'home_play', lives });
      setShowNoLivesModal(true);
      return;
    }

    // Log play tap
    log('home_play_tap', {
      nextMode: nextUp.mode,
      subjectId: nextUp.subjectId,
    });

    const params: any = {
      subject: nextUp.subjectId,
    };

    if (nextUp.mode === 'daily') {
      params.daily = '1';
      params.dailySubjectId = nextUp.subjectId;
    }

    router.push({
      pathname: '/quiz-screen',
      params,
    });
  };

  // Rotating tips
  const tips = [
    "Pro tip: Voltooi je dagelijkse uitdagingen voor extra XP en tokens! 💎",
    "Herinnering: Je streak blijft actief zolang je elke dag speelt! 🔥",
    "Tip: Gebruik je tokens in de shop om levens en streak protection te kopen! 🛒",
    "Wist je dat? Perfecte scores geven je bonus tokens! ⭐",
  ];
  const currentTip = tips[Math.floor(Math.random() * tips.length)];

  const actionSheetItems: ActionSheetItem[] = [
    {
      icon: actionIcons.shop,
      label: 'Shop',
      onPress: () => router.push('/(tabs)/shop'),
    },
    ...(flags.show_non_mvp_tabs
      ? [
          {
            icon: actionIcons.settings,
            label: 'Settings',
            onPress: () => router.push('/(tabs)/profile'),
          },
          {
            icon: actionIcons.faq,
            label: 'FAQ / Help',
            onPress: () => router.push('/(tabs)/profile'),
          },
          {
            icon: actionIcons.credits,
            label: 'Credits',
            onPress: () => router.push('/(tabs)/profile'),
          },
        ]
      : []),
  ];

  // MVP release path: enforce the core loop layout by default.
  const shouldShowMVP = flags.mvp_core_loop;
  
  // Core Loop MVP Layout
  if (shouldShowMVP) {
    return (
      <Screen header={<HUD compact />} padding="m">
        <View style={styles.mvpContainer}>
          <Text style={styles.mvpTitle}>ARCADE ACADEMY</Text>

          <View style={styles.playButtonContainer}>
            <BigPlayButton label="PLAY" onPress={startNextUp} />
          </View>

          <View style={styles.nextUpCard}>
            <Text style={styles.nextUpLabel}>VOLGENDE CHALLENGE</Text>
            <Body subdued align="center" style={styles.nextUpText}>
              {nextUpLabel}
            </Body>
          </View>

          <View style={styles.bitByteContainer}>
            <BitByte mood="idle" size="md" />
          </View>
        </View>

        {/* FAB - Keep for menu access */}
        <FAB onPress={() => setShowActionSheet(true)} />

        {/* ActionSheet */}
        <ActionSheet
          visible={showActionSheet}
          onClose={() => setShowActionSheet(false)}
          items={actionSheetItems}
          title="Menu"
        />

        <ConfirmModal
          visible={showNoLivesModal}
          title="Geen levens meer"
          message={getNoLivesReason()}
          primaryText="Ga naar Shop"
          onPrimary={() => {
            log('no_lives_shop_tap', { entry: 'home_play' });
            setShowNoLivesModal(false);
            router.push('/(tabs)/shop');
          }}
          secondaryText="Watch Ad (Coming Soon)"
          secondaryDisabled
          onSecondary={() => {
            log('no_lives_watch_ad_tap', { entry: 'home_play', state: 'disabled' });
            showToast('Watch Ad komt binnenkort', 'error');
          }}
          cancelText="Annuleren"
          onCancel={() => {
            log('no_lives_modal_dismiss', { entry: 'home_play' });
            setShowNoLivesModal(false);
          }}
        />
      </Screen>
    );
  }

  // Original Layout (when mvp_core_loop is false)
  return (
    <Screen header={<HUD compact />} padding="m" scroll>
      {/* Quick Actions */}
      {flags.show_home_quick_actions && (
        <>
          <Section title="Quick Actions">
            <HomeQuickActions />
          </Section>
          <Divider subtle />
        </>
      )}

      {/* Daily Challenge Section */}
      <Section title="Dagelijkse Reeks">
        <DailyChallengeMap />
      </Section>

      <Divider subtle />

      {/* Weekly Challenges Summary */}
      {flags.show_weekly_on_home && flags.weekly_challenges && week && (
        <>
          <Section title="Weekly Challenges">
            <View style={styles.challengesCard}>
              <Text style={styles.challengesText}>
                Completed {completedCount}/{totalCount} this week
              </Text>
              <RetroButton onPress={() => router.push('/(tabs)/challenges')} style={styles.challengesButton}>
                View Challenges 🎯
              </RetroButton>
            </View>
          </Section>
          <Divider subtle />
        </>
      )}

      {/* Shop CTA */}
      <Section title="Shop">
        <RetroButton onPress={() => router.push('/(tabs)/shop')}>
          Bezoek Shop 💎
        </RetroButton>
      </Section>

      <Divider subtle />

      {/* BitByte Section */}
      <Section title="BitByte">
        {showTip ? (
          <DialogBox
            message={currentTip}
            continueText="Oké!"
            onContinue={() => setShowTip(false)}
            style={styles.tipDialog}
          />
        ) : (
          <View style={styles.bitByteInfo}>
            <Body align="center" style={styles.bitByteText}>
              Je persoonlijke leermaatje dat met je meegroeit! 🎮
            </Body>
            <RetroButton
              size="small"
              variant="ghost"
              onPress={() => setShowTip(true)}
              style={styles.tipButton}
            >
              💡 Tip
            </RetroButton>
          </View>
        )}
      </Section>

      <Divider subtle />

      {/* Badges Section (Placeholder) */}
      <Section title="Badges">
        <View style={styles.badgesGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={styles.badgeTile}>
              <Text style={styles.badgeIcon}>🏆</Text>
              <Body style={styles.badgeText}>Coming soon</Body>
            </View>
          ))}
        </View>
      </Section>

      {/* FAB */}
      <FAB onPress={() => setShowActionSheet(true)} />

      {/* ActionSheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        items={actionSheetItems}
        title="Menu"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  mvpContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.l,
    paddingVertical: spacing.xl,
  },
  mvpTitle: {
    fontFamily: fonts.arcade,
    fontSize: 13,
    color: colors.neonGreen,
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  playButtonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  nextUpCard: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: `${colors.electricPurple}66`,
    borderRadius: radii.m,
    backgroundColor: colors.cardBg,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.l,
    alignItems: 'center',
    gap: spacing.xs,
  },
  nextUpLabel: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.electricPurple,
    letterSpacing: 0.6,
  },
  nextUpText: {
    fontSize: 13,
    color: colors.textPrimary,
  },
  bitByteContainer: {
    marginTop: spacing.m,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderColor: `${colors.neonGreen}35`,
    borderRadius: radii.m,
    backgroundColor: colors.cardBg,
  },
  bitByteInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.l,
    gap: spacing.m,
    minHeight: 120,
  },
  bitByteText: {
    color: colors.grey[600],
    maxWidth: 280,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  tipDialog: {
    width: '100%',
  },
  tipButton: {
    margin: 0,
    marginTop: spacing.s,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  badgeTile: {
    width: 96,
    height: 96,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radii.m,
    borderWidth: 1,
    borderColor: colors.grey[600],
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s,
  },
  badgeIcon: {
    fontSize: 32,
    opacity: 0.5,
  },
  badgeText: {
    fontSize: 9,
    color: colors.grey[600],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  challengesCard: {
    backgroundColor: colors.deep,
    padding: spacing.m,
    borderRadius: radii.m,
    borderWidth: 1,
    borderColor: colors.neon + '30',
    gap: spacing.s,
  },
  challengesText: {
    fontFamily: fonts.body, // System font for body text
    fontSize: 12,
    color: colors.white,
    textAlign: 'center',
  },
  challengesButton: {
    margin: 0,
  },
});

export default HomeScreen; 
