import HUD from '@/components/hud/HUD';
import Screen from '@/components/layout/Screen';
import RetroButton from '@/components/shared/RetroButton';
import Body from '@/components/ui/Body';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { SpeedDial, SpeedDialAction } from '@/components/ui/SpeedDial';
import { useBoosters } from '@/contexts/BoostersContext';
import { useTokens } from '@/contexts/TokenContext';
import { useSound } from '@/contexts/SoundContext';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import { log, logEvent } from '@/lib/analytics';
import { localQuizRepository } from '@/lib/content/localRepository';
import { toGradeBand } from '@/lib/content/profile';
import { selectPracticeQuestions } from '@/lib/content/selector';
import { actionIcons } from '@/lib/icons';
import { canStartQuiz, getNoLivesReason } from '@/lib/quizAccess';
import { shouldLogQuizAbandon } from '@/lib/quizRunLifecycle';
import { getQuizTimings } from '@/lib/quizTiming';
import { colors, fonts, spacing } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { completeTimeToPlay } from '@/lib/kpis';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { flags } from '@/lib/flags';
import { useHaptics } from '@/utils/haptics';
import type { QuestionV2 } from '@/types/content';

const GOLDEN_PATH_QUESTION_COUNT = 5;

const QuizScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ subject?: string; daily?: string; dailySubjectId?: string }>();
  const subject = params.subject;
  const dailyParam = params.daily;
  const isDaily = dailyParam === 'true' || dailyParam === '1';
  const dailySubjectId = params.dailySubjectId;
  const {
    grade,
    level,
    subjectsUnlocked,
    lives,
    consumeLife,
    addXP,
    userLevel,
    quizSpeed,
    runStart,
    runAddCorrect,
    runEnd,
  } = useUser();
  const { play: playSound } = useSound();
  const { show: showToast } = useToast();
  const { canUse, useFiftyFifty: activateFiftyFifty, useSkip: activateSkip, addBoosters } = useBoosters();
  const { canAfford, spend } = useTokens();
  const [questions, setQuestions] = useState<QuestionV2[]>([]);
  const [activePackId, setActivePackId] = useState<string>('unknown_pack');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLocking, setIsLocking] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, 'correct' | 'wrong' | undefined>>({});
  const [eliminatedByQ, setEliminatedByQ] = useState<Record<number, number[]>>({});
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const runStartedRef = useRef(false);
  const runFinishedRef = useRef(false);
  const prevLevelRef = useRef(userLevel);
  const actionRef = useRef(false); // Prevent double actions
  const scoreRef = useRef(0);
  const questionsLengthRef = useRef(0);
  const activePackIdRef = useRef('unknown_pack');
  const currentIndexRef = useRef(0);
  
  // Telemetry: Track quiz state
  const quizStartTimeRef = useRef<number | null>(null);
  const questionStartTimesRef = useRef<Record<number, number>>({});
  const noLivesLoggedRef = useRef(false);
  
  // Juice Pack: Haptics
  const haptics = useHaptics();
  const timings = useMemo(() => getQuizTimings(quizSpeed), [quizSpeed]);

  useEffect(() => {
    scoreRef.current = 0;
    runStartedRef.current = false;
    runFinishedRef.current = false;
    quizStartTimeRef.current = null;
    questionStartTimesRef.current = {};
    setCurrentIndex(0);
    setFeedbackMap({});
    setEliminatedByQ({});
    setIsLocking(false);
  }, [subject, isDaily, dailySubjectId]);

  useEffect(() => {
    questionsLengthRef.current = questions.length;
  }, [questions.length]);

  useEffect(() => {
    activePackIdRef.current = activePackId;
  }, [activePackId]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (!canStartQuiz(lives)) {
      setShowNoLivesModal(true);
      if (!noLivesLoggedRef.current) {
        noLivesLoggedRef.current = true;
        log('quiz_start_blocked_no_lives', { entry: 'quiz_screen', subjectId: subject || 'unknown', lives });
      }
      return;
    }
    noLivesLoggedRef.current = false;
    setShowNoLivesModal(false);
  }, [lives, subject]);

  const getDurationMs = React.useCallback((): number => {
    return quizStartTimeRef.current ? Date.now() - quizStartTimeRef.current : 0;
  }, []);

  const markQuizFinished = React.useCallback(
    (params: { completed: boolean; gameOver: boolean; finalScore: number }) => {
      if (runFinishedRef.current) {
        return;
      }
      runFinishedRef.current = true;
      log('quiz_completed', {
        completed: params.completed,
        gameOver: params.gameOver,
        finalScore: params.finalScore,
        total: questionsLengthRef.current,
        packId: activePackId,
        durationMs: getDurationMs(),
      });
    },
    [activePackId, getDurationMs]
  );

  const navigateToResult = React.useCallback(
    (params: { finalScore: number; gameOver?: boolean }) => {
      router.replace({
        pathname: '/result-screen',
        params: {
          score: String(params.finalScore),
          total: String(questions.length),
          subject: subject || '',
          daily: isDaily ? '1' : undefined,
          dailySubjectId: isDaily ? dailySubjectId : undefined,
          gameOver: params.gameOver ? '1' : undefined,
        },
      });
    },
    [dailySubjectId, isDaily, questions.length, router, subject]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions(): Promise<void> {
      const gradeBand = toGradeBand(level, grade);

      if (isDaily) {
        const today = new Date().toISOString().slice(0, 10);
        const dailyQuestions = await localQuizRepository.getDailySet(today, {
          grade_band: gradeBand,
          subjects_unlocked: subjectsUnlocked,
        }, GOLDEN_PATH_QUESTION_COUNT);
        if (!cancelled) {
          setQuestions(dailyQuestions);
          setActivePackId('daily_mixed_offline');
        }
        return;
      }

      const packList = await localQuizRepository.getPackList();
      const preferred = packList.find(
        (meta) =>
          meta.enabled &&
          meta.subject.toLowerCase() === String(subject || '').toLowerCase() &&
          meta.grade_band === gradeBand
      );
      const subjectFallback = packList.find(
        (meta) => meta.enabled && meta.subject.toLowerCase() === String(subject || '').toLowerCase()
      );
      const selected = preferred || subjectFallback || packList[0];

      if (!selected) {
        if (!cancelled) {
          setQuestions([]);
          setActivePackId('missing_pack');
        }
        return;
      }

      if (!preferred) {
        log('content_fallback_used', {
          reason: 'practice_pack_resolution',
          subjectId: subject || 'unknown',
          gradeBand,
          selectedPackId: selected.pack_id,
        });
      }

      const pack = await localQuizRepository.getPack(selected.pack_id);
      const practiceQuestions = selectPracticeQuestions(pack, GOLDEN_PATH_QUESTION_COUNT);
      if (!cancelled) {
        setQuestions(practiceQuestions);
        setActivePackId(pack.pack_id);
      }
    }

    loadQuestions().catch((error) => {
      log('content_fallback_used', {
        reason: 'load_questions_exception',
        error: error instanceof Error ? error.message : 'unknown_error',
      });
      if (!cancelled) {
        setQuestions([]);
        setActivePackId('error_fallback');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [subject, grade, level, isDaily, subjectsUnlocked]);

  // NOTE: Lives are NOT reset on quiz start - they only regenerate via timer (20min)

  useEffect(() => {
    if (!runStartedRef.current && questions.length > 0 && canStartQuiz(lives)) {
      const sessionSubject = isDaily ? dailySubjectId || subject : subject;
      const mode = isDaily ? 'daily' : 'practice';
      
      runStart(sessionSubject, isDaily, questions.length);
      runStartedRef.current = true;
      
      // Track quiz start
      const startTime = Date.now();
      quizStartTimeRef.current = startTime;
      questionStartTimesRef.current[0] = startTime;
      
      // Complete time-to-play KPI
      const timeToPlayMs = completeTimeToPlay();
      
      // Log quiz start
      log('quiz_started', {
        mode,
        subjectId: sessionSubject,
        packId: activePackId,
        qCount: questions.length,
        timeToPlayMs,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions.length, subject, isDaily, dailySubjectId, activePackId, lives]);

  useEffect(() => {
    return () => {
      if (!shouldLogQuizAbandon({ runStarted: runStartedRef.current, runFinished: runFinishedRef.current })) {
        return;
      }
      log('quiz_abandon', {
        finalScore: scoreRef.current,
        total: questionsLengthRef.current,
        packId: activePackIdRef.current,
        durationMs: getDurationMs(),
        qIndex: currentIndexRef.current,
      });
      runEnd();
    };
  }, [getDurationMs, runEnd]);

  // FIX: level-up effect
  useEffect(() => {
    if (userLevel > prevLevelRef.current) {
      playSound('levelup');
    }
    prevLevelRef.current = userLevel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLevel]);

  const handleAnswer = (index: number) => {
    // Double-tap protection
    if (isLocking) return;

    const correctIndex = questions[currentIndex].correct_option_index;
    const isCorrect = correctIndex === index;

    // Track answer timing
    const answerStartTime = questionStartTimesRef.current[currentIndex] || Date.now();
    const timeMs = Date.now() - answerStartTime;

    // Lock inputs and show feedback
    setIsLocking(true);
    
    // Log answer
    log('question_answered', {
      correct: isCorrect,
      qIndex: currentIndex,
      packId: activePackId,
      difficulty: questions[currentIndex].difficulty,
      timeMs,
    });

    // Build feedback map: highlight clicked + always show correct answer
    const newFeedback: Record<number, 'correct' | 'wrong' | undefined> = {};
    if (isCorrect) {
      newFeedback[index] = 'correct';
    } else {
      newFeedback[index] = 'wrong';
      newFeedback[correctIndex] = 'correct';
    }
    setFeedbackMap(newFeedback);

    // Play sound immediately
    playSound(isCorrect ? 'correct' : 'wrong');

    // Juice Pack: Visual feedback (animations handled in AnimatedOption component)
    if (flags.juice_pack && !isCorrect) {
      haptics.impact('medium');
    }

    if (isCorrect) {
      // XP rewards: base 25 XP + bonus for harder questions
      const baseXP = 25;
      const difficultyBonus = Math.floor((currentIndex + 1) * 5);
      const totalXP = baseXP + difficultyBonus;

      addXP(totalXP);
      runAddCorrect(); // Direct stat update
      const nextScore = scoreRef.current + 1;
      scoreRef.current = nextScore;

      // Next question after delay
      setTimeout(() => {
        goToNextQuestion(nextScore);
      }, timings.feedbackMs);
    } else {
      // Wrong answer: check lives
      const nextLives = lives - 1;
      consumeLife();

      if (nextLives === 0) {
        // Game over!
        const finalScore = scoreRef.current;
        markQuizFinished({
          completed: false,
          gameOver: true,
          finalScore,
        });
        setTimeout(() => {
          navigateToResult({ finalScore, gameOver: true });
        }, timings.gameOverDelayMs);
      } else {
        // Continue with next question
        setTimeout(() => {
          goToNextQuestion();
        }, timings.feedbackMs);
      }
    }
  };

  const goToNextQuestion = React.useCallback((finalScoreOverride?: number) => {
    const finalScore = typeof finalScoreOverride === 'number' ? finalScoreOverride : scoreRef.current;

    // Check for end of quiz
    if (currentIndex === questions.length - 1) {
      markQuizFinished({
        completed: true,
        gameOver: false,
        finalScore,
      });
      navigateToResult({ finalScore });
      return;
    }

    // Next question - track start time
    const nextIndex = currentIndex + 1;
    questionStartTimesRef.current[nextIndex] = Date.now();
    
    // Next question
    setCurrentIndex((i) => i + 1);
    setFeedbackMap({});
    setIsLocking(false);
    // Clear ephemeral booster state
    // Note: eliminatedByQ persists per question index, which is fine
  }, [currentIndex, markQuizFinished, navigateToResult, questions.length]);

  // Booster costs (constants)
  const FIFTY_FIFTY_COST = 15;
  const SKIP_COST = 20;

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);
  const hasAnswerFeedback = Object.keys(feedbackMap).length > 0;

  const applyFiftyFifty = React.useCallback(() => {
    if (isLocking || actionRef.current) return;
    if (!currentQuestion) return;

    const usedFiftyThisQ = !!eliminatedByQ[currentIndex]?.length;
    if (usedFiftyThisQ) {
      showToast('50/50 al gebruikt voor deze vraag', 'error');
      return;
    }

    const correctIndex = currentQuestion.correct_option_index;
    const optionsLen = currentQuestion.options.length;

    // Check if we can use (balance or can afford)
    const hasBalance = canUse('fiftyFifty');
    const canBuy = !hasBalance && canAfford(FIFTY_FIFTY_COST);

    if (!hasBalance && !canBuy) {
      showToast('Geen 50/50 beschikbaar', 'error');
      logEvent('booster_blocked', { type: 'fiftyFifty', reason: 'insufficient_balance' });
      return;
    }

    actionRef.current = true;

    // Buy if needed (before using)
    if (canBuy) {
      try {
        spend(FIFTY_FIFTY_COST, 'hint', { booster: 'fiftyFifty' });
        // Add booster after purchase
        addBoosters('fiftyFifty', 1);
      } catch {
        showToast('Kon 50/50 niet kopen', 'error');
        actionRef.current = false;
        return;
      }
    }

    // Find 2 wrong indices to eliminate
    const wrongIndices: number[] = [];
    for (let i = 0; i < optionsLen; i++) {
      if (i !== correctIndex) {
        wrongIndices.push(i);
      }
    }

    // Shuffle and take 2 (or max available if less than 2 wrong)
    const shuffled = wrongIndices.sort(() => Math.random() - 0.5);
    const eliminated = shuffled.slice(0, Math.min(2, wrongIndices.length));

    // Ensure we keep at least 2 options visible (correct + 1 wrong)
    if (eliminated.length >= wrongIndices.length && eliminated.length > 0) {
      eliminated.pop(); // Remove one to keep 2 visible
    }

    setEliminatedByQ((prev) => ({
      ...prev,
      [currentIndex]: eliminated,
    }));

    // Use booster
    const result = activateFiftyFifty(currentQuestion.id || `q${currentIndex}`, correctIndex, optionsLen);
    if (result) {
      playSound('coin');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showToast('50/50 actief', 'success');
      logEvent('booster_used', { type: 'fiftyFifty', q: currentIndex, subject });
    }

    setTimeout(() => {
      actionRef.current = false;
    }, 300);
  }, [currentIndex, currentQuestion, isLocking, canUse, canAfford, spend, addBoosters, activateFiftyFifty, playSound, showToast, subject, eliminatedByQ]);

  const applySkip = React.useCallback(() => {
    if (isLocking || actionRef.current) return;

    const hasBalance = canUse('skip');
    const canBuy = !hasBalance && canAfford(SKIP_COST);

    if (!hasBalance && !canBuy) {
      showToast('Geen skip meer', 'error');
      logEvent('booster_blocked', { type: 'skip', reason: 'insufficient_balance' });
      return;
    }

    // Buy if needed (before using)
    if (canBuy) {
      try {
        spend(SKIP_COST, 'hint', { booster: 'skip' });
        // Add booster after purchase
        addBoosters('skip', 1);
      } catch {
        showToast('Kon skip niet kopen', 'error');
        actionRef.current = false;
        return;
      }
    }

    actionRef.current = true;

    const result = activateSkip();
    if (result === 'ok') {
      playSound('coin');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showToast('Vraag overgeslagen', 'success');
      logEvent('booster_used', { type: 'skip', q: currentIndex, subject });

      // Skip without XP/life changes
      setIsLocking(true);
      setTimeout(() => {
        goToNextQuestion();
        actionRef.current = false;
      }, 400);
    } else {
      showToast('Kon skip niet gebruiken', 'error');
      actionRef.current = false;
    }
  }, [isLocking, canUse, canAfford, spend, addBoosters, activateSkip, playSound, showToast, currentIndex, subject, goToNextQuestion]);

  // SpeedDial actions
  const speedDialActions: SpeedDialAction[] = useMemo(() => {
    const usedFiftyThisQ = !!eliminatedByQ[currentIndex]?.length;
    const hasFiftyBalance = canUse('fiftyFifty') || canAfford(FIFTY_FIFTY_COST);
    const hasSkipBalance = canUse('skip') || canAfford(SKIP_COST);

    return [
      {
        id: 'fiftyFifty',
        label: '50/50',
        icon: actionIcons.fifty,
        onPress: applyFiftyFifty,
        disabled: isLocking || usedFiftyThisQ || !hasFiftyBalance,
      },
      {
        id: 'skip',
        label: 'Skip',
        icon: actionIcons.skip,
        onPress: applySkip,
        disabled: isLocking || !hasSkipBalance,
      },
    ];
  }, [currentIndex, isLocking, eliminatedByQ, canUse, canAfford, applyFiftyFifty, applySkip]);

  // Get visible options (filter out eliminated)
  const visibleOptions = useMemo(() => {
    if (!currentQuestion) return [];
    const eliminated = eliminatedByQ[currentIndex] ?? [];
    return currentQuestion.options.map((label, index) => ({
      label,
      index, // Original index for answer handling
    })).filter(({ index: idx }) => !eliminated.includes(idx));
  }, [currentQuestion, currentIndex, eliminatedByQ]);

  // Empty state fallback
  if (!canStartQuiz(lives)) {
    return (
      <Screen header={<HUD compact />} padding="m">
        <View style={styles.loadingContainer}>
          <Body style={styles.emptyText}>{getNoLivesReason()}</Body>
          <RetroButton
            onPress={() => {
              log('no_lives_shop_tap', { entry: 'quiz_screen' });
              router.replace('/(tabs)/shop');
            }}
          >
            GA NAAR SHOP
          </RetroButton>
        </View>
        <ConfirmModal
          visible={showNoLivesModal}
          title="Geen levens meer"
          message={getNoLivesReason()}
          primaryText="Ga naar Shop"
          onPrimary={() => {
            log('no_lives_shop_tap', { entry: 'quiz_screen_modal' });
            setShowNoLivesModal(false);
            router.replace('/(tabs)/shop');
          }}
          secondaryText="Watch Ad (Coming Soon)"
          secondaryDisabled
          onSecondary={() => {
            log('no_lives_watch_ad_tap', { entry: 'quiz_screen_modal', state: 'disabled' });
            showToast('Watch Ad komt binnenkort', 'error');
          }}
          cancelText="Annuleren"
          onCancel={() => {
            log('no_lives_modal_dismiss', { entry: 'quiz_screen_modal' });
            setShowNoLivesModal(false);
            router.replace('/(tabs)/home');
          }}
        />
      </Screen>
    );
  }

  // Empty state fallback
  if (questions.length === 0) {
    return (
      <Screen header={<HUD compact />} padding="m">
        <View style={styles.loadingContainer}>
          <Body style={styles.emptyText}>
            Geen vragen gevonden voor dit vak/niveau.
          </Body>
          <RetroButton onPress={() => router.replace('/(tabs)/quiz')} style={styles.backButton}>
            Terug
          </RetroButton>
        </View>
      </Screen>
    );
  }

  // Loading state
  if (!currentQuestion) {
    return (
      <Screen header={<HUD compact />} padding="m">
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Quiz laden...</Text>
        </View>
      </Screen>
    );
  }

  const getButtonStyle = (index: number) => {
    const feedback = feedbackMap[index];
    if (feedback === 'correct') {
      return {
        backgroundColor: colors.neon,
        borderColor: colors.neon,
      };
    }
    if (feedback === 'wrong') {
      return {
        backgroundColor: colors.error,
        borderColor: colors.error,
      };
    }
    // Default: secondary variant for better visibility
    return {
      backgroundColor: `${colors.bgDeep}CC`,
      borderColor: `${colors.neonGreen}66`,
    };
  };

  const getButtonTextStyle = (index: number) => {
    const feedback = feedbackMap[index];
    const baseStyle = {
      fontSize: 14,
      lineHeight: 18,
      textAlign: 'center' as const,
      color: colors.white, // Default white text for visibility
    };
    
    if (feedback === 'correct' || feedback === 'wrong') {
      return { ...baseStyle, color: colors.dark };
    }
    return baseStyle;
  };

  // Juice Pack: Option component with animations
  const AnimatedOption = React.memo(function AnimatedOption({
    label, 
    originalIndex, 
    onPress, 
    isLocking, 
    buttonStyle, 
    textStyle,
    feedback 
  }: {
    label: string;
    originalIndex: number;
    onPress: () => void;
    isLocking: boolean;
    buttonStyle: any;
    textStyle: any;
    feedback?: 'correct' | 'wrong';
  }) {
    const scale = useSharedValue(1);
    const shake = useSharedValue(0);
    const flashOpacity = useSharedValue(0);
    const flashColor = useSharedValue(colors.success);

    const animatedScaleStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const animatedShakeStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shake.value }],
    }));

    const animatedFlashStyle = useAnimatedStyle(() => ({
      opacity: flashOpacity.value,
      backgroundColor: flashColor.value,
    }));

    // Trigger animations when feedback changes
    React.useEffect(() => {
      if (!flags.juice_pack || !feedback) return;

      if (feedback === 'correct') {
        // Green flash + pop scale
        flashColor.value = colors.success;
        flashOpacity.value = withSequence(
          withTiming(0.6, { duration: 100 }),
          withTiming(0, { duration: 200 })
        );
        scale.value = withSequence(
          withSpring(1.05, { damping: 10, stiffness: 300 }),
          withSpring(1.0, { damping: 10, stiffness: 300 })
        );
      } else if (feedback === 'wrong') {
        // Red flash + shake
        flashColor.value = colors.error;
        flashOpacity.value = withSequence(
          withTiming(0.6, { duration: 100 }),
          withTiming(0, { duration: 200 })
        );
        shake.value = withSequence(
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(-4, { duration: 50 }),
          withTiming(4, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
      }
    }, [feedback, flashColor, flashOpacity, scale, shake]);

    if (!flags.juice_pack) {
      return (
        <View style={styles.optionWrapper}>
          <RetroButton
            onPress={onPress}
            disabled={isLocking}
            variant="secondary"
            style={[styles.quizButton, buttonStyle]}
            textStyle={textStyle}
          >
            {label}
          </RetroButton>
        </View>
      );
    }

    return (
      <View style={styles.optionWrapper}>
        <Animated.View style={[animatedScaleStyle, animatedShakeStyle]}>
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              { borderRadius: 12 },
              animatedFlashStyle,
            ]}
            pointerEvents="none"
          />
          <RetroButton
            onPress={onPress}
            disabled={isLocking}
            variant="secondary"
            style={[styles.quizButton, buttonStyle]}
            textStyle={textStyle}
          >
            {label}
          </RetroButton>
        </Animated.View>
      </View>
    );
  });

  return (
    <Screen header={<HUD compact />} padding="m">
      <View style={styles.content}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Vraag {currentIndex + 1} / {questions.length}
          </Text>
        </View>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
        </View>

        <View style={styles.optionsContainer}>
          {visibleOptions.map(({ label, index: originalIndex }) => {
            const eliminated = eliminatedByQ[currentIndex]?.includes(originalIndex);
            if (eliminated) return null; // Shouldn't happen due to filter, but safety check

            return (
              <AnimatedOption
                key={originalIndex}
                label={label}
                originalIndex={originalIndex}
                onPress={() => handleAnswer(originalIndex)}
                isLocking={isLocking}
                buttonStyle={getButtonStyle(originalIndex)}
                textStyle={getButtonTextStyle(originalIndex)}
                feedback={feedbackMap[originalIndex]}
              />
            );
          })}
        </View>

        {hasAnswerFeedback && (
          <View style={styles.explanationCard}>
            <Text style={styles.explanationLabel}>UITLEG</Text>
            <Body style={styles.explanationText}>{currentQuestion.explanation_short}</Body>
          </View>
        )}
      </View>

      {/* SpeedDial */}
      <SpeedDial
        open={speedDialOpen}
        onToggle={() => setSpeedDialOpen(!speedDialOpen)}
        actions={speedDialActions}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: spacing.m,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.l,
  },
  loadingText: {
    fontFamily: fonts.arcade,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.grey[600],
    textAlign: 'center',
    fontSize: 16,
  },
  backButton: {
    marginTop: spacing.m,
  },
  progressHeader: {
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderWidth: 1,
    borderColor: `${colors.neonGreen}40`,
    borderRadius: 10,
    backgroundColor: colors.cardBg,
  },
  progressText: {
    fontFamily: fonts.arcade,
    color: colors.neonGreen,
    fontSize: 12,
  },
  questionContainer: {
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'flex-start',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: `${colors.neonGreen}40`,
    borderRadius: 12,
    paddingHorizontal: spacing.l,
    paddingVertical: spacing.l,
  },
  questionText: {
    fontFamily: fonts.arcade,
    fontSize: 15,
    color: colors.textPrimary,
    textAlign: 'left',
    lineHeight: 24,
  },
  optionsContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: spacing.m,
  },
  optionWrapper: {
    width: '100%',
    minHeight: 64,
  },
  quizButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    margin: 0,
    minHeight: 64,
  },
  explanationCard: {
    borderWidth: 1,
    borderColor: `${colors.neonGreen}35`,
    backgroundColor: colors.cardBg,
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    gap: spacing.xs,
  },
  explanationLabel: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.neonGreen,
    letterSpacing: 0.6,
  },
  explanationText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default QuizScreen; 
