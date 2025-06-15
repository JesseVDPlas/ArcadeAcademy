import HeartIcon from '@/assets/images/heart.png';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { quizActions, useQuiz } from '../contexts/QuizContext';

// Placeholder componenten
const LifeBar = ({ lives }: { lives: number }) => (
  <View style={{ flexDirection: 'row', marginBottom: 24 }}>
    {[...Array(3)].map((_, i) => (
      <Image
        key={i}
        source={HeartIcon}
        style={{ width: 24, height: 24, marginHorizontal: 4, opacity: lives > i ? 1 : 0.2 }}
        resizeMode="contain"
      />
    ))}
  </View>
);
const BitByte = () => (
  <View style={{ alignItems: 'center', marginBottom: 16 }}>
    <Image source={require('@/assets/images/bitbyte.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
  </View>
);
const RetroButton = ({ children, onPress, disabled }: any) => (
  <Pressable
    style={({ pressed }) => [
      styles.option,
      pressed && { backgroundColor: '#39FF14', borderColor: '#FF00FF' },
      disabled && { opacity: 0.5 },
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={styles.optionText}>{children}</Text>
  </Pressable>
);

export default function QuizScreen() {
  const router = useRouter();
  const { state, dispatch } = useQuiz();
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const { width } = useWindowDimensions();

  // questions should come from context or props, adjust as needed
  // For now, assume questions are available in context as state.questions
  const questions = state.questions || [];
  const loading = false; // adjust if you have loading state

  if (loading || !questions || questions.length === 0) {
    return <View style={styles.container}><Text style={styles.loading}>Laden...</Text></View>;
  }

  const currentQuestion = questions[state.current];
  const isEnd = state.current >= questions.length || state.lives === 0;

  const handleOption = (idx: number) => {
    if (feedback || isEnd) return;
    setSelected(idx);
    const correct = currentQuestion.correctIndex === idx;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      dispatch(quizActions.correct());
    } else {
      dispatch(quizActions.wrong());
    }
    setTimeout(() => {
      setFeedback(null);
      setSelected(null);
      if (state.current + 1 >= questions.length || (state.lives - (correct ? 0 : 1)) === 0) {
        router.push('/result-screen');
      }
    }, 900);
  };

  if (!currentQuestion || isEnd) return null;

  return (
    <View style={styles.container}>
      <LifeBar lives={state.lives} />
      <BitByte />
      <Text style={[styles.question, { fontSize: width < 380 ? 20 : 22 }]}>{currentQuestion.question}</Text>
      <View style={styles.optionsRow}>
        {currentQuestion.options.map((opt: string, idx: number) => (
          <RetroButton
            key={idx}
            onPress={() => handleOption(idx)}
            disabled={feedback !== null}
            style={[
              styles.option,
              selected === idx ? styles.selected : {},
              { width: width < 380 ? '90%' : 320, paddingVertical: width < 380 ? 12 : 16 },
            ]}
          >
            <Text style={[styles.optionText, { fontSize: width < 380 ? 16 : 18 }]}>{opt}</Text>
          </RetroButton>
        ))}
      </View>
      {feedback && (
        <Text style={[styles.feedback, feedback === 'correct' ? styles.correct : styles.wrong]}>
          {feedback === 'correct' ? 'Correct!' : 'Fout!'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  question: {
    color: '#39FF14',
    fontSize: 22,
    fontFamily: 'ArcadeFont',
    marginBottom: 32,
    textAlign: 'center',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 1,
  },
  optionsRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  option: {
    backgroundColor: '#111',
    borderColor: '#39FF14',
    borderWidth: 2,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 36,
    marginVertical: 8,
    width: 280,
    alignItems: 'center',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  optionText: {
    color: '#39FF14',
    fontSize: 18,
    fontFamily: 'ArcadeFont',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  feedback: {
    fontSize: 24,
    fontFamily: 'ArcadeFont',
    marginTop: 16,
    textAlign: 'center',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  correct: {
    color: '#39FF14',
  },
  wrong: {
    color: '#FF00FF',
  },
  loading: {
    color: '#39FF14',
    fontFamily: 'ArcadeFont',
    fontSize: 20,
    marginTop: 40,
  },
  selected: {
    backgroundColor: '#39FF14',
    borderColor: '#FF00FF',
    borderWidth: 2,
  },
}); 