import HUD from '@/components/hud/HUD';
import Screen from '@/components/layout/Screen';
import RetroButton from '@/components/shared/RetroButton';
import BitByte, { BitByteMood } from '@/components/ui/BitByte';
import { useChallenges } from '@/contexts/ChallengesContext';
import { useSound } from '@/contexts/SoundContext';
import { useTokens } from '@/contexts/TokenContext';
import { useToast } from '@/contexts/ToastContext';
import { SubjectId, useUser } from '@/contexts/UserContext';
import { log, logEvent } from '@/lib/analytics';
import { computeResultSettlement } from '@/lib/resultSettlement';
import { isoWeekKey } from '@/lib/time';
import { resolveNextUp } from '@/utils/nextUp';
import { colors, fonts, spacing } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { trackResultClimax, completeResultClimax } from '@/lib/kpis';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withRepeat,
  withSpring,
} from 'react-native-reanimated';
import { flags } from '@/lib/flags';

const RESULT_CLIMAX_MS = 1600;

const ResultScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    score: string;
    total: string;
    subject: string;
    daily?: string;
    dailySubjectId?: string;
    gameOver?: string;
  }>();
  const {
    dailyChallenge,
    subjectsUnlocked,
    userLevel,
    addCompletedQuiz,
    dailyDone,
    runSession,
    getRunXpDelta,
    runEnd,
    updateStreakIfDailyCleared,
    setBestScore,
  } = useUser();
  const { earn } = useTokens();
  const { increment } = useChallenges();
  const { show: showToast } = useToast();
  const { play: playSound } = useSound();

  const scoreParam = Number(params.score || 0);
  const totalParam = Number(params.total || 0);
  const subjectParam = params.subject || '';
  const isGameOver = params.gameOver === 'true' || params.gameOver === '1';

  const settlement = computeResultSettlement(params, runSession, 'minimal_safe_settle');
  const isRejected = settlement.rejected;
  const correct = settlement.correct;
  const total = settlement.total;
  const xpThisRun = getRunXpDelta();
  const sessionSubjectId = runSession.subjectId;
  const subject = subjectParam || sessionSubjectId || '';
  const isDaily = settlement.isDaily;
  const perfect = total > 0 && correct === total;
  const percentage = total > 0 ? (correct / total) * 100 : 0;
  const bitByteMood: BitByteMood = isGameOver ? 'sad' : percentage >= 50 ? 'happy' : 'sad';
  const tokensToAdd = correct + (perfect ? 1 : 0);
  const awardedTokens = isDaily ? tokensToAdd : 0;
  const awardedRef = useRef(false);
  
  // Core Loop MVP: Climax animation state (buttons disabled for 2-3s)
  const [buttonsEnabled, setButtonsEnabled] = useState(false);
  
  // Juice Pack: Result screen animations
  const xpPulseOpacity = useSharedValue(0);
  const tokenPulseOpacity = useSharedValue(0);
  const tokenScale = useSharedValue(1);
  const prevUserLevel = useRef(userLevel);
  
  const xpPulseStyle = useAnimatedStyle(() => ({
    opacity: xpPulseOpacity.value,
  }));

  const tokenPulseStyle = useAnimatedStyle(() => ({
    opacity: tokenPulseOpacity.value,
  }));

  const tokenScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: tokenScale.value }],
  }));
  
  // Track result climax start
  useEffect(() => {
    const mountTime = Date.now();
    trackResultClimax(mountTime);
  }, []);
  
  useEffect(() => {
    if (flags.juice_pack) {
      // XP fill pulse: opacity 0→0.5→0 twice
      xpPulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 300 }),
          withTiming(0, { duration: 300 }),
          withTiming(0.5, { duration: 300 }),
          withTiming(0, { duration: 300 })
        ),
        1,
        false
      );

      // Token micro pulse (keep row static and readable)
      if (awardedTokens > 0) {
        tokenPulseOpacity.value = withSequence(
          withTiming(0.45, { duration: 180 }),
          withTiming(0, { duration: 220 }),
          withTiming(0.35, { duration: 180 }),
          withTiming(0, { duration: 220 })
        );
        tokenScale.value = withSequence(
          withSpring(1.04, { damping: 14, stiffness: 280 }),
          withSpring(1, { damping: 14, stiffness: 280 })
        );
      }

      // Play sound based on level change
      const leveledUp = userLevel > prevUserLevel.current;
      if (leveledUp) {
        playSound('levelup');
      } else if (awardedTokens > 0) {
        playSound('coin');
      }
      prevUserLevel.current = userLevel;
    }

    const timer = setTimeout(() => {
      completeResultClimax();
      setButtonsEnabled(true);
    }, RESULT_CLIMAX_MS);
    
    return () => clearTimeout(timer);
  }, [xpPulseOpacity, tokenPulseOpacity, tokenScale, awardedTokens, userLevel, playSound]);

  useEffect(() => {
    // Safety guards
    if (awardedRef.current) return;
    if (total <= 0) return;
    if (settlement.mismatch) {
      log('result_score_mismatch_detected', {
        scoreParam,
        runSessionCorrect: runSession.correct,
        totalParam,
        runSessionTotal: runSession.total,
        subjectId: subject,
        source: settlement.source,
      });
    }

    if (settlement.rejected) {
      log('result_settlement_rejected', {
        reason: 'missing_trusted_run_snapshot',
        scoreParam,
        totalParam,
        subjectId: subject,
      });
      showToast('Resultaat niet bevestigd. Ga terug naar Home.', 'error');
      runEnd();
      awardedRef.current = true;
      return;
    }

    // Pre-compute daily completion detection
    let willCompleteDaily = false;
    if (isDaily && sessionSubjectId) {
      const { order, progress } = dailyChallenge;
      const idx = order.indexOf(sessionSubjectId as SubjectId);
      if (idx !== -1) {
        const isLast = idx === order.length - 1;
        const allPrevDone = order.slice(0, idx).every(id => progress[id] === 'done');
        willCompleteDaily = isLast && allPrevDone;
      }
    }

    // Award tokens for daily
    if (isDaily) {
      if (awardedTokens > 0) {
        earn(awardedTokens, 'quiz_complete', { correct, total, perfect, isDaily: true, weekKey: isoWeekKey() });
        logEvent('token_earned', { amount: awardedTokens, reason: 'quiz_complete' });
      }
      if (perfect) {
        showToast('Perfect +1 token', 'success');
        playSound('levelup');
        // Increment perfects challenge
        increment('perfects');
      }
      // Mark subject as done
      if (sessionSubjectId && ['nl', 'math', 'hist', 'geo'].includes(sessionSubjectId as SubjectId)) {
        dailyDone(sessionSubjectId as SubjectId);
      }
      // Daily completion
      if (willCompleteDaily) {
        const today = new Date().toISOString().slice(0, 10);
        updateStreakIfDailyCleared(today);
        log('daily_completed', {
          date: today,
          subjectId: sessionSubjectId,
          correct,
          total,
        });
        showToast('Daily voltooid', 'success');
        // Increment dailies challenge
        increment('dailies');
      }
      // Increment quizzes challenge for daily quiz
      increment('quizzes');
    } else {
      // Non-daily: update best score
      const pct = Math.round(percentage);
      if (sessionSubjectId && ['nl', 'math', 'hist', 'geo'].includes(sessionSubjectId as SubjectId)) {
        setBestScore(sessionSubjectId as SubjectId, pct);
      }
      // Commit completion at quiz-finish time (not only when user taps "Home").
      if (percentage >= 50) {
        const sourceSubject = (sessionSubjectId || subject).toLowerCase();
        if (['nl', 'math', 'hist', 'geo'].includes(sourceSubject)) {
          const subjectId = sourceSubject as SubjectId;
          const quizId = `${subjectId}_vwo_1`;
          addCompletedQuiz(subjectId, quizId);
        }
      }
      // Increment quizzes challenge
      increment('quizzes');
      // Increment perfects if perfect score
      if (perfect) {
        increment('perfects');
      }
    }

    runEnd();
    awardedRef.current = true;
  }, [
    earn,
    dailyDone,
    dailyChallenge,
    playSound,
    correct,
    increment,
    perfect,
    runEnd,
    sessionSubjectId,
    showToast,
    isDaily,
    settlement.mismatch,
    settlement.rejected,
    settlement.source,
    scoreParam,
    totalParam,
    subject,
    runSession.correct,
    runSession.total,
    awardedTokens,
    total,
    percentage,
    updateStreakIfDailyCleared,
    setBestScore,
    addCompletedQuiz,
  ]);

  const handleRestart = () => {
    // NOTE: Lives are NOT reset - they only regenerate via timer (20min)
    router.replace({
      pathname: '/(tabs)/quiz/[subject]',
      params: {
        subject,
        daily: isDaily ? '1' : undefined,
        dailySubjectId: isDaily ? sessionSubjectId : undefined,
      },
    });
  };

  const handleHome = () => {
    // NOTE: Lives are NOT reset - they only regenerate via timer (20min)
    router.replace('/(tabs)/home');
  };

  const handleNextRound = () => {
    // Resolve next up and navigate
    const nextUp = resolveNextUp({ dailyChallenge, subjectsUnlocked });
    
    // Log next round tap
    log('result_next_round_tap', {
      suggestedMode: nextUp.mode,
      subjectId: nextUp.subjectId,
    });
    
    const params: any = {
      subject: nextUp.subjectId,
    };

    if (nextUp.mode === 'daily') {
      params.daily = '1';
      params.dailySubjectId = nextUp.subjectId;
    }

    router.replace({
      pathname: '/quiz-screen',
      params,
    });
  };

  return (
    <Screen header={<HUD compact />} padding="m">
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={[styles.title, isGameOver && styles.gameOverTitle]}>
            {isGameOver ? 'GAME OVER' : 'QUIZ VOLTOOID'}
          </Text>
        </View>

        {/* BitByte */}
        <View style={styles.bitByteContainer}>
          <BitByte mood={bitByteMood} />
        </View>

        {/* Score Section */}
        <View style={styles.scoreSection}>
          <Text style={styles.scoreLabel}>SCORE</Text>
          <Text style={styles.scoreText}>{correct} / {total}</Text>
          <Text style={styles.percentageText}>
            {percentage.toFixed(0)}%
          </Text>
        </View>

        {/* Feedback */}
        <Text style={styles.feedbackText}>
          {isRejected
            ? 'Resultaat niet bevestigd. Probeer opnieuw vanuit Home.'
            : isGameOver
            ? 'Geen levens meer!'
            : percentage >= 50
            ? 'Goed gedaan!'
            : 'Volgende keer beter!'}
        </Text>

        {/* Rewards */}
        {!isRejected && (
          <View style={styles.rewardsContainer}>
            <View style={styles.rewardRow}>
              {flags.juice_pack && (
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    { backgroundColor: colors.neonGreen, borderRadius: 12 },
                    xpPulseStyle,
                  ]}
                  pointerEvents="none"
                />
              )}
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardBadgeText}>XP</Text>
              </View>
              <Text style={styles.rewardLabel}>+ {xpThisRun} XP</Text>
            </View>
            <View style={styles.rewardRow}>
              <Animated.View style={tokenScaleStyle}>
                <View style={styles.rewardBadge}>
                  {flags.juice_pack && awardedTokens > 0 && (
                    <Animated.View
                      style={[StyleSheet.absoluteFill, styles.tokenPulseOverlay, tokenPulseStyle]}
                      pointerEvents="none"
                    />
                  )}
                  <Text style={styles.rewardBadgeText}>TOK</Text>
                </View>
              </Animated.View>
              <Animated.Text
                style={[
                  styles.rewardLabel,
                  awardedTokens === 0 && styles.rewardLabelMuted,
                  tokenScaleStyle,
                ]}
              >
                {awardedTokens > 0 ? `+ ${awardedTokens} tokens` : '0 tokens (alleen daily)'}
              </Animated.Text>
            </View>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {!isRejected && (
            <>
              <RetroButton 
                onPress={handleNextRound}
                size="large"
                style={styles.button}
                disabled={!buttonsEnabled}
              >
                NEXT ROUND
              </RetroButton>
              <RetroButton 
                onPress={handleRestart}
                variant="secondary"
                size="large"
                style={styles.button}
                disabled={!buttonsEnabled}
              >
                Nogmaals spelen
              </RetroButton>
            </>
          )}
          <RetroButton 
            onPress={handleHome}
            variant="ghost"
            size="large"
            style={styles.button}
            disabled={!buttonsEnabled}
          >
            {isRejected ? 'Terug naar Home' : 'Home'}
          </RetroButton>
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.l,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.s,
  },
  title: {
    fontFamily: fonts.arcade,
    fontSize: 24,
    color: colors.neonGreen,
    textAlign: 'center',
    textShadowColor: colors.neonGreen,
    textShadowRadius: 8,
    textShadowOffset: { width: 0, height: 0 },
    letterSpacing: 0.8,
  },
  gameOverTitle: {
    color: colors.error,
    textShadowColor: colors.error,
  },
  bitByteContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.m,
  },
  scoreSection: {
    alignItems: 'center',
    marginVertical: spacing.m,
    gap: spacing.xs,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.neonGreen}50`,
  },
  scoreLabel: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.electricPurple,
    letterSpacing: 0.8,
  },
  scoreText: {
    fontFamily: fonts.arcade,
    fontSize: 22,
    color: colors.white,
    textAlign: 'center',
  },
  percentageText: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.neonGreen,
    textAlign: 'center',
  },
  feedbackText: {
    fontFamily: fonts.arcade,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
    marginVertical: spacing.s,
  },
  rewardsContainer: {
    alignItems: 'center',
    marginVertical: spacing.l,
    gap: spacing.m,
    paddingVertical: spacing.m,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.cardBg + '80',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.neonGreen + '40',
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.m,
  },
  rewardBadge: {
    minWidth: 44,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.s,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.neonGreen}70`,
    backgroundColor: `${colors.bgDeep}AA`,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  tokenPulseOverlay: {
    backgroundColor: colors.neonGreen,
    opacity: 0,
  },
  rewardBadgeText: {
    fontFamily: fonts.arcade,
    fontSize: 9,
    color: colors.neonGreen,
  },
  rewardLabel: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.neonGreen,
    textAlign: 'center',
  },
  rewardLabelMuted: {
    color: colors.grey[500],
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
    marginTop: spacing.m,
    gap: spacing.m,
    alignItems: 'stretch',
  },
  button: {
    width: '100%',
    margin: 0,
  },
});

export default ResultScreen; 
