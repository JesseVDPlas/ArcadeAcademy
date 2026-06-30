import quizData from '@/assets/data/test_quiz_data_vwo1.json';
import RetroButton from '@/components/shared/RetroButton';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import { log } from '@/lib/analytics';
import { canStartQuiz, getNoLivesReason } from '@/lib/quizAccess';
import { colors, fonts, spacing } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const QuizSubjectScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ subject: string; daily?: string; dailySubjectId?: string }>();
  const subject = params.subject;
  const dailyParam = params.daily;
  const isDaily = dailyParam === '1' || dailyParam === 'true';
  const dailySubjectId = params.dailySubjectId;
  const { grade, level, lives } = useUser();
  const { show: showToast } = useToast();
  const [showNoLivesModal, setShowNoLivesModal] = React.useState(false);

  if (!subject) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Onderwerp niet gevonden</Text>
      </SafeAreaView>
    );
  }

  const combinedClassLevel = `${level || ''} ${grade || ''}`.trim();
  const questions = quizData.quizzes.find(
    (q) =>
      q.subject.toLowerCase() === subject.toLowerCase() &&
      q.class_level.toLowerCase() === combinedClassLevel.toLowerCase()
  )?.questions;

  if (!questions || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Geen vragen gevonden voor {subject}</Text>
      </SafeAreaView>
    );
  }

  const handleStart = () => {
    if (!canStartQuiz(lives)) {
      log('quiz_start_blocked_no_lives', { entry: 'subject_start', subject, lives });
      setShowNoLivesModal(true);
      return;
    }

    router.push({
      pathname: '/quiz-screen',
      params: { subject, daily: isDaily ? '1' : undefined, dailySubjectId },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {subject} - {combinedClassLevel.toUpperCase()}
        </Text>
        <Text style={styles.subtitle}>
          {isDaily ? 'Daily Challenge • Klaar voor de uitdaging?' : 'Klaar voor de uitdaging?'}
        </Text>
        <Text style={styles.questionCount}>{questions.length} Vragen</Text>
        <RetroButton onPress={handleStart}>START</RetroButton>
      </View>

      <ConfirmModal
        visible={showNoLivesModal}
        title="Geen levens meer"
        message={getNoLivesReason()}
        primaryText="Ga naar Shop"
        onPrimary={() => {
          log('no_lives_shop_tap', { entry: 'subject_start', subject });
          setShowNoLivesModal(false);
          router.push('/(tabs)/shop');
        }}
        secondaryText="Watch Ad (Coming Soon)"
        secondaryDisabled
        onSecondary={() => {
          log('no_lives_watch_ad_tap', { entry: 'subject_start', subject, state: 'disabled' });
          showToast('Watch Ad komt binnenkort', 'error');
        }}
        cancelText="Annuleren"
        onCancel={() => {
          log('no_lives_modal_dismiss', { entry: 'subject_start', subject });
          setShowNoLivesModal(false);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.arcade,
    fontSize: 24,
    color: colors.neon,
    textAlign: 'center',
    marginBottom: spacing.m,
  },
  subtitle: {
    fontFamily: fonts.arcade,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  questionCount: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.pink,
    marginBottom: spacing.xl,
  },
});

export default QuizSubjectScreen; 
