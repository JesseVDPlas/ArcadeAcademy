import quizData from '@/assets/data/test_quiz_data_vwo1.json';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Map from '../../components/home/Map';
import { useQuiz } from '../../contexts/QuizContext';
import { useUser } from '../../contexts/UserContext';

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
  const { name, grade } = useUser();
  const { dispatch } = useQuiz();

  useEffect(() => {
    if (!name) {
      router.replace('/onboarding/set-name');
    }
  }, [name, router]);

  if (!name) return null;
  if (!quizData || !quizData.quizzes) return <View style={styles.container}><Text style={{ color: 'red', fontSize: 18 }}>Quizdata niet gevonden</Text></View>;

  try {
    // Filter quizzes op leerjaar (genormaliseerd)
    const filteredQuizzes = quizData.quizzes.filter(q => normalizeGrade(q.class_level) === normalizeGrade(grade || ''));
    const subjects = Array.from(new Set(filteredQuizzes.map(q => q.subject)));

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welkom terug, {name}!</Text>
        {/* Dummy XP/streak UI */}
        <View style={styles.xpRow}>
          <Text style={styles.xpText}>XP: 1200</Text>
          <Text style={styles.xpText}>🔥 Streak: 3</Text>
        </View>
        {subjects.length === 0 ? (
          <Text style={styles.noQuiz}>Er zijn nog geen levels voor jouw leerjaar.</Text>
        ) : (
          <Map />
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