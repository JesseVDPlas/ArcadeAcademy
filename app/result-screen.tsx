import RetroButton from '@/components/shared/RetroButton';
import BitByte, { BitByteMood } from '@/components/ui/BitByte';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts, spacing } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ResultScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    score: string;
    total: string;
    subject: string;
    gameOver?: string;
  }>();
  const { addTokens, resetLives, addCompletedQuiz } = useUser();

  const score = Number(params.score || 0);
  const total = Number(params.total || 0);
  const subject = params.subject || '';
  const isGameOver = params.gameOver === 'true';

  const percentage = total > 0 ? (score / total) * 100 : 0;
  const bitByteMood: BitByteMood = isGameOver ? 'sad' : percentage >= 50 ? 'happy' : 'sad';
  const xpGained = score * 10; // 10 XP per correct answer
  const tokensGained = percentage === 100 ? 5 : 0;

  useEffect(() => {
    if (tokensGained > 0) {
      addTokens(tokensGained);
    }
    // Mark as completed if user passed
    if (percentage >= 50) {
      const quizId = `${subject.toLowerCase()}_vwo_1`; // simplified from data file for now
      addCompletedQuiz(quizId);
    }
  }, []);

  const handleRestart = () => {
    resetLives();
    router.replace({ pathname: '/quiz-screen', params: { subject } });
  };

  const handleHome = () => {
    resetLives();
    router.replace('/(tabs)/home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{isGameOver ? 'Game Over' : 'Quiz Voltooid!'}</Text>
        <BitByte mood={bitByteMood} />

        <Text style={styles.scoreText}>
          Je score: {score} / {total} ({percentage.toFixed(0)}%)
        </Text>
        <Text style={styles.feedbackText}>
          {isGameOver
            ? 'Geen levens meer!'
            : percentage >= 50
            ? 'Goed gedaan!'
            : 'Volgende keer beter!'}
        </Text>

        <View style={styles.rewardsContainer}>
          <Text style={styles.rewardLabel}>+ {xpGained} XP</Text>
          {tokensGained > 0 && <Text style={styles.rewardLabel}>+ {tokensGained} Tokens</Text>}
        </View>

        <View style={styles.buttonContainer}>
          <RetroButton onPress={handleRestart}>Opnieuw</RetroButton>
          <RetroButton onPress={handleHome}>Home</RetroButton>
        </View>
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
  },
  content: {
    alignItems: 'center',
    padding: spacing.m,
  },
  title: {
    fontFamily: fonts.arcade,
    fontSize: 28,
    color: colors.neon,
    marginBottom: spacing.l,
    textShadowColor: colors.neon,
    textShadowRadius: 10,
  },
  scoreText: {
    fontFamily: fonts.arcade,
    fontSize: 18,
    color: colors.white,
    marginVertical: spacing.m,
  },
  feedbackText: {
    fontFamily: fonts.arcade,
    fontSize: 16,
    color: colors.pink,
    marginBottom: spacing.l,
  },
  rewardsContainer: {
    marginVertical: spacing.l,
  },
  rewardLabel: {
    fontFamily: fonts.arcade,
    fontSize: 18,
    color: colors.green,
    textAlign: 'center',
    marginVertical: spacing.s,
  },
  buttonContainer: {
    marginTop: spacing.l,
    width: '80%',
    gap: spacing.m,
  },
});

export default ResultScreen; 