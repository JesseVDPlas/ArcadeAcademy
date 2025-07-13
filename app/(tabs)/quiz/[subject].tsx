import quizData from '@/assets/data/test_quiz_data_vwo1.json';
import RetroButton from '@/components/shared/RetroButton';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts, spacing } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const QuizSubjectScreen = () => {
  const router = useRouter();
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { grade, level } = useUser();

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
    router.push({
      pathname: '/quiz-screen',
      params: { subject },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {subject} - {combinedClassLevel.toUpperCase()}
        </Text>
        <Text style={styles.subtitle}>Klaar voor de uitdaging?</Text>
        <Text style={styles.questionCount}>{questions.length} Vragen</Text>
        <RetroButton onPress={handleStart}>START</RetroButton>
      </View>
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