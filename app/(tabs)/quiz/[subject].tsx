import quizData from '@/assets/data/test_quiz_data_vwo1.json';
import { RetroButton } from '@/components/shared/RetroButton';
import ScreenWrapper from '@/components/shared/ScreenWrapper';
import { Question } from '@/contexts/QuizContext';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts, spacing } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function SubjectQuizScreen() {
  const router = useRouter();
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { grade, level } = useUser();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  useEffect(() => {
    if (subject && grade && level) {
      const classLevel = `${level.toUpperCase()} ${grade}`;
      const decodedSubject = decodeURIComponent(subject);
      
      const quiz = quizData.quizzes.find(
        q =>
          q.subject.toLowerCase() === decodedSubject.toLowerCase() &&
          q.class_level.trim().toUpperCase() === classLevel
      );

      if (quiz && quiz.questions.length > 0) {
        setQuestions(quiz.questions as unknown as Question[]);
      } else {
        Alert.alert(
          'Quiz niet gevonden',
          `Geen quiz gevonden voor ${decodedSubject} op niveau ${classLevel}.`
        );
        router.back();
      }
    }
  }, [subject, grade, level]);

  const handleAnswerPress = (optionIndex: number) => {
    setSelectedAnswer(optionIndex);
    const correct = questions[currentQuestionIndex].correct_option_index === optionIndex;
    if (correct) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      goToNextQuestion();
    }, 1000); 
  };
  
  const goToNextQuestion = () => {
    setSelectedAnswer(null);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
  };
  
  const getButtonStyles = (index: number): { button: object, text: object } => {
    if (selectedAnswer === null) {
      return { button: styles.optionButton, text: styles.optionText };
    }
    const isCorrect = index === questions[currentQuestionIndex].correct_option_index;
    const isSelected = index === selectedAnswer;

    if (isCorrect) {
      return { button: [styles.optionButton, styles.correctButton], text: styles.correctButtonText };
    }
    if (isSelected) {
      return { button: [styles.optionButton, styles.incorrectButton], text: styles.incorrectButtonText };
    }
    return { button: styles.optionButton, text: styles.optionText };
  };
  
  if (quizFinished) {
    return (
      <ScreenWrapper style={styles.container}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreTitle}>Quiz Voltooid!</Text>
          <Text style={styles.scoreText}>
            Je score: {score} / {questions.length} ({questions.length > 0 ? ((score / questions.length) * 100).toFixed(0) : 0}%)
          </Text>
          <RetroButton onPress={restartQuiz} style={{ marginVertical: spacing.m }}>
            Opnieuw
          </RetroButton>
          <RetroButton onPress={() => router.replace('/home')}>
            Home
          </RetroButton>
        </View>
      </ScreenWrapper>
    );
  }

  if (questions.length === 0) {
    return (
      <ScreenWrapper style={styles.container}>
        <Text style={styles.loadingText}>Quiz laden...</Text>
      </ScreenWrapper>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question_text}</Text>
      </View>
      <View style={styles.optionsContainer}>
        {currentQuestion.options.map((option, index) => {
          const {button, text} = getButtonStyles(index);
          return (
            <RetroButton
              key={index}
              onPress={() => handleAnswerPress(index)}
              style={button}
              disabled={selectedAnswer !== null}
            >
               <Text style={text}>{option}</Text>
            </RetroButton>
          )
        })}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.m,
    justifyContent: 'space-between',
  },
  loadingText: {
    fontFamily: fonts.arcade,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  questionText: {
    fontFamily: fonts.arcade,
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 30,
  },
  optionsContainer: {
    paddingBottom: spacing.l,
  },
  optionButton: {
    marginVertical: spacing.s,
    backgroundColor: colors.dark,
    borderColor: colors.neon,
    borderWidth: 2,
  },
  optionText: {
     fontFamily: fonts.arcade,
     fontSize: 14,
     color: colors.neon,
  },
  correctButton: {
    backgroundColor: colors.neon,
    borderColor: colors.neon,
  },
  correctButtonText: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.dark,
  },
  incorrectButton: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  incorrectButtonText: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.white,
  },
  scoreContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreTitle: {
    fontFamily: fonts.arcade,
    fontSize: 24,
    color: colors.neon,
    marginBottom: spacing.l,
  },
  scoreText: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.white,
    marginBottom: spacing.xl,
  },
}); 