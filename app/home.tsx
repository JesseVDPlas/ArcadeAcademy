import quizData from '@/assets/data/test_quiz_data_vwo1.json';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { quizActions, useQuiz } from '../contexts/QuizContext';
import { useUser } from '../contexts/UserContext';

function normalizeGrade(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .split(' ')
    .sort()
    .join(' ')
    .trim();
}

export default function Home() {
  const router = useRouter();
  const { user } = useUser();
  const { dispatch } = useQuiz();

  useEffect(() => {
    if (!user) {
      router.replace('/onboarding/set-name');
    }
  }, [user, router]);

  if (!user) return null;
  if (!quizData || !quizData.quizzes) return <View style={styles.container}><Text style={{ color: 'red', fontSize: 18 }}>Quizdata niet gevonden</Text></View>;

  try {
    // Filter quizzes op leerjaar (genormaliseerd)
    const filteredQuizzes = quizData.quizzes.filter(q => normalizeGrade(q.class_level) === normalizeGrade(user.grade));
    const subjects = Array.from(new Set(filteredQuizzes.map(q => q.subject)));

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welkom terug, {user.name}!</Text>
        {/* Dummy XP/streak UI */}
        <View style={styles.xpRow}>
          <Text style={styles.xpText}>XP: 1200</Text>
          <Text style={styles.xpText}>🔥 Streak: 3</Text>
        </View>
        {subjects.length === 0 ? (
          <Text style={styles.noQuiz}>Er zijn nog geen levels voor jouw leerjaar.</Text>
        ) : (
          <FlatList
            data={subjects}
            numColumns={2}
            keyExtractor={item => item}
            contentContainerStyle={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 8,
              gap: 12,
            }}
            columnWrapperStyle={{
              gap: 12,
              justifyContent: 'center',
            }}
            renderItem={({ item }) => (
              <Pressable
                style={styles.button}
                onPress={() => {
                  // 1. Filter quiz op subject en klas
                  const filtered = quizData.quizzes.filter(
                    (q: any) =>
                      q.subject.toLowerCase() === item.toLowerCase() &&
                      normalizeGrade(q.class_level) === normalizeGrade(user.grade)
                  );
                  const quiz = filtered[0];
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
                  // Shuffle en pak max 5
                  mappedQuestions = mappedQuestions.sort(() => 0.5 - Math.random()).slice(0, 5);
                  dispatch(quizActions.setQuestions(mappedQuestions));
                  dispatch(quizActions.start());
                  router.push('/quiz-screen');
                }}
              >
                <Text style={styles.buttonText}>{item}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    );
  } catch (e) {
    return <View style={styles.container}><Text style={{ color: 'red', fontSize: 18 }}>Runtime error: {String(e)}</Text></View>;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingHorizontal: 12,
  },
  title: {
    color: '#39FF14',
    fontSize: 26,
    fontFamily: 'ArcadeFont',
    marginBottom: 18,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 24,
  },
  xpText: {
    color: '#39FF14',
    fontFamily: 'ArcadeFont',
    fontSize: 14,
    opacity: 0.8,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    width: '48%',
    backgroundColor: '#111',
    borderColor: '#39FF14',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 28,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  buttonText: {
    color: '#39FF14',
    fontSize: 18,
    fontFamily: 'ArcadeFont',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  noQuiz: {
    color: '#FF00FF',
    fontFamily: 'ArcadeFont',
    fontSize: 18,
    marginTop: 40,
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
}); 