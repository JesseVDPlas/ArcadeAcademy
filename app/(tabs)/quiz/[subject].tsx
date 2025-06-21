import quizData from '@/assets/data/test_quiz_data_vwo1.json';
import RetroButton from '@/components/shared/RetroButton';
import ScreenWrapper from '@/components/shared/ScreenWrapper';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

export default function QuizSubject() {
  const router = useRouter();
  const { subject } = useLocalSearchParams<{ subject: string }>();
  const { grade, level } = useUser();
  // Zoek quiz voor dit vak en profiel
  const classLevel = `${level?.toUpperCase()} ${grade}`;
  const quiz = quizData.quizzes.find(
    q =>
      q.subject.toLowerCase() === subject?.toLowerCase() &&
      q.class_level.trim().toUpperCase() === classLevel
  );
  const questions = quiz ? quiz.questions : [];

  return (
    <ScreenWrapper style={styles.container}>
      <Text style={styles.title}>
        {subject?.toUpperCase()} – {grade}
      </Text>
      <RetroButton
        style={styles.button}
        onPress={() => router.push({ pathname: '/quiz-screen', params: { subject } })}
        disabled={questions.length === 0}
      >
        {questions.length > 0 ? `Start ${questions.length} vragen` : 'Geen vragen beschikbaar'}
      </RetroButton>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  title: {
    color: colors.neon,
    fontFamily: fonts.arcade,
    fontSize: 22,
    marginBottom: 32,
    textAlign: 'center',
  },
  button: { marginTop: 24 },
}); 