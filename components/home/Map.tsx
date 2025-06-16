import quizData from '@/assets/data/test_quiz_data_vwo1.json';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, Pressable, ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { quizActions, useQuiz } from '../../contexts/QuizContext';

// Placeholder IslandTile component
const IslandTile = ({ status, img, onPress }: any) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    if (status === 'current') {
      scale.value = withRepeat(withTiming(1.12, { duration: 700 }), -1, true);
    } else {
      scale.value = withTiming(1, { duration: 200 });
    }
  }, [status]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
    ],
  }));

  const handleLockedPress = () => {
    // Shake animatie
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-8, { duration: 40 }),
      withTiming(8, { duration: 40 }),
      withTiming(0, { duration: 40 })
    );
    if (Platform.OS === 'android') {
      ToastAndroid.show('Level locked', ToastAndroid.SHORT);
    }
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={status === 'locked' ? handleLockedPress : onPress}
        style={[styles.tile, status === 'locked' && styles.locked, status === 'current' && styles.current, status === 'done' && styles.done]}
        disabled={false}
      >
        <Image source={img} style={styles.img} />
      </Pressable>
    </Animated.View>
  );
};

const ISLANDS = [
  { status: 'done', img: require('@/assets/images/island1.png') },
  { status: 'done', img: require('@/assets/images/island1.png') },
  { status: 'current', img: require('@/assets/images/island1.png') },
  { status: 'locked', img: require('@/assets/images/island1.png') },
  { status: 'locked', img: require('@/assets/images/island1.png') },
];

export default function Map() {
  const router = useRouter();
  const { state, dispatch } = useQuiz();

  // Dummy quiz selection logic (pak eerste quiz)
  const startQuiz = () => {
    const quiz = quizData.quizzes[0];
    let mappedQuestions = quiz
      ? quiz.questions.map((q: any, idx: number) => ({
          id: `${quiz.subject}-${quiz.class_level}-${idx}`,
          paragraph: q.paragraph || '',
          question: q.question_text,
          options: q.options.map((opt: string) => opt.replace(/^'/, '').replace(/'$/, '')),
          correctIndex: q.correct_option_index,
          explanation: q.explanation || '',
        }))
      : [];
    mappedQuestions = mappedQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
    dispatch(quizActions.setQuestions(mappedQuestions));
    dispatch(quizActions.start());
    router.push('/quiz-screen');
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {state.levels.map((level, idx) => (
        <IslandTile
          key={level.id}
          status={level.status}
          img={require('@/assets/images/island1.png')}
          onPress={level.status === 'current' ? () => startQuiz() : undefined}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 8,
    gap: 16,
  },
  tile: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    borderWidth: 3,
    borderColor: '#39FF14',
    opacity: 1,
  },
  locked: {
    opacity: 0.4,
    borderColor: '#888',
  },
  current: {
    borderColor: '#FF00FF',
    opacity: 1,
  },
  done: {
    borderColor: '#39FF14',
    opacity: 1,
  },
  img: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
}); 