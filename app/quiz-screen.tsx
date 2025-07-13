import quizData from '@/assets/data/test_quiz_data_vwo1.json';
import LifeBar from '@/components/shared/LifeBar';
import RetroButton from '@/components/shared/RetroButton';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts, spacing } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define the type for a single question
type Question = {
  id: string;
  question_text: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
};

const QuizScreen = () => {
  const router = useRouter();
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { grade, level, lives, useLife, addXP, resetLives } = useUser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const combinedClassLevel = `${level || ''} ${grade || ''}`.trim();
    const quiz = quizData.quizzes.find(
      (q) =>
        q.subject.toLowerCase() === subject?.toLowerCase() &&
        q.class_level.toLowerCase() === combinedClassLevel.toLowerCase()
    );
    if (quiz?.questions) {
      setQuestions(quiz.questions as Question[]);
    }
  }, [subject, grade, level]);

  useEffect(() => {
    // Reset lives at the start of a new quiz
    resetLives();
  }, []);

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    const correct = questions[currentIndex].correct_option_index === index;
    setSelectedAnswer(index);
    setIsCorrect(correct);

    if (correct) {
      addXP(10);
      setScore((s) => s + 1);
    } else {
      useLife();
    }

    setTimeout(() => {
      // Check for game over
      if (!correct && lives <= 1) {
        router.replace({
          pathname: '/result-screen',
          params: {
            score: score.toString(),
            total: questions.length.toString(),
            subject: subject,
            gameOver: 'true',
          },
        });
        return;
      }

      // Check for end of quiz
      if (currentIndex === questions.length - 1) {
        router.replace({
          pathname: '/result-screen',
          params: {
            score: (correct ? score + 1 : score).toString(),
            total: questions.length.toString(),
            subject: subject,
          },
        });
        return;
      }

      // Next question
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
    }, 1200);
  };

  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Quiz laden...</Text>
      </SafeAreaView>
    );
  }

  const getButtonVariant = (index: number) => {
    if (selectedAnswer === null) return 'primary';
    const correctIndex = questions[currentIndex].correct_option_index;
    if (index === correctIndex) return 'success';
    if (index === selectedAnswer && selectedAnswer !== correctIndex) return 'danger';
    return 'primary';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.progressText}>
          Vraag {currentIndex + 1} / {questions.length}
        </Text>
        <LifeBar lives={lives} maxLives={5} />
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => (
          <RetroButton
            key={index}
            onPress={() => handleAnswer(index)}
            disabled={selectedAnswer !== null}
            variant={getButtonVariant(index)}
            selected={selectedAnswer === index && getButtonVariant(index) === 'primary'}
          >
            {option}
          </RetroButton>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    padding: spacing.m,
  },
  loadingText: {
    fontFamily: fonts.arcade,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.s,
  },
  progressText: {
    fontFamily: fonts.arcade,
    color: colors.white,
    fontSize: 14,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
  },
  questionText: {
    fontFamily: fonts.arcade,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsContainer: {
    paddingBottom: spacing.l,
    gap: spacing.m,
  },
});

export default QuizScreen; 