import { colors, fonts, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { quizActions, useQuiz } from '../contexts/QuizContext';
import XPBar from './XPBar';

// Emoji fallback mapping
const ICONS = {
  win: require('@/assets/images/trophy.png'),
  normal: require('@/assets/images/bitbyte.png'),
  lose: require('@/assets/images/sad.png'),
};

export default function ResultScreen() {
  const router = useRouter();
  const { state, dispatch } = useQuiz();
  const [isNewRecord, setIsNewRecord] = useState(false);
  const { height } = useWindowDimensions();
  const maxScore = (state as any).questions?.length || 0;
  const score = state.score;
  const highScore = state.highScore;

  useEffect(() => {
    if (score > highScore) {
      setIsNewRecord(true);
      dispatch(quizActions.setHighScore(score));
    }
    if (score > 0) {
      dispatch(quizActions.levelDone(0));
    }
    // eslint-disable-next-line
  }, []);

  let resultType = 'normal';
  if (isNewRecord && score > 0) {
    resultType = 'win';
  } else if (score === 0) {
    resultType = 'lose';
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={[styles.container, { minHeight: height }]}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {score > 0 ? (isNewRecord ? 'Nieuw Record!' : 'You Win!') : 'Game Over'}
        </Text>
        <Text style={styles.score}>Score: {score} / {maxScore}</Text>
        <XPBar score={score} />
        <Text style={styles.highScore}>High Score: {highScore}</Text>
        <View style={styles.bitbyteContainer}>
          <Image source={ICONS[resultType as keyof typeof ICONS]} style={{width:80,height:80,marginBottom:spacing.m}} />
        </View>
        <View style={styles.buttonsRow}>
          <Pressable
            style={styles.button}
            onPress={() => {
              dispatch(quizActions.start());
              router.push('/home');
            }}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.leaderboardButton]}
            onPress={() => router.push('/leaderboard' as any)}
          >
            <Text style={styles.buttonText}>Leaderboard</Text>
          </Pressable>
    </View>
        <Pressable
          style={[styles.button, { marginTop: spacing.m, alignSelf: 'center', width: '60%' }]}
          onPress={() => router.push('/home')}
        >
          <Text style={styles.buttonText}>Terug naar Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dark },
  container: { flexGrow: 1, alignItems: 'center', justifyContent: 'space-between', padding: spacing.l },
  title: {
    color: '#39FF14',
    fontSize: 36,
    fontFamily: fonts.arcade,
    marginBottom: 16,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  score: {
    color: '#FF00FF',
    fontSize: 24,
    fontFamily: fonts.arcade,
    marginBottom: 8,
  },
  highScore: {
    color: '#39FF14',
    fontSize: 18,
    fontFamily: fonts.arcade,
    marginBottom: 16,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    opacity: 0.8,
    alignSelf: 'center',
  },
  bitbyteContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  buttonsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', marginTop: spacing.l },
  button: { flexBasis: '45%' },
  leaderboardButton: {
    borderColor: '#FF00FF',
  },
  buttonText: {
    color: '#39FF14',
    fontSize: 20,
    fontFamily: fonts.arcade,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
}); 