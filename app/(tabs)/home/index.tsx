import LifeBar from '@/components/shared/LifeBar';
import RetroButton from '@/components/shared/RetroButton';
import ScreenWrapper from '@/components/shared/ScreenWrapper';
import BitByte from '@/components/ui/BitByte';
import { XPBar } from '@/components/ui/XPBar';
import { useQuiz } from '@/contexts/QuizContext';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts } from '@/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { name, preferredSubjects } = useUser();
  const { state } = useQuiz();

  const handleStartPress = () => {
    // Gebruik het eerste voorkeursvak, of een fallback
    const subjectToStart = preferredSubjects?.[0] || 'Geschiedenis';
    router.push(`/quiz/${encodeURIComponent(subjectToStart)}`);
  };

  // Tijdelijke XP data
  const userXP = 75;
  const maxXP = 100;

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welkom terug, {name}!</Text>
        <LifeBar lives={state.lives} />
      </View>
      <View style={styles.xpSection}>
        <Text style={styles.xpLabel}>XP</Text>
        <XPBar progress={userXP / maxXP} />
      </View>
      <View style={styles.mainAction}>
        <BitByte mood="happy" />
        <RetroButton onPress={handleStartPress} style={styles.startButton}>
          <Text style={styles.startButtonText}>PRESS START</Text>
        </RetroButton>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontFamily: fonts.arcade,
    fontSize: 16,
    color: colors.neon,
  },
  xpSection: {
    marginTop: 24,
  },
  xpLabel: {
    fontFamily: fonts.arcade,
    color: '#fff',
    marginBottom: 8,
  },
  mainAction: {
    alignItems: 'center',
    marginBottom: 48,
  },
  startButton: {
    width: '80%',
    paddingVertical: 20,
  },
  startButtonText: {
    fontFamily: fonts.arcade,
    color: colors.neon,
    fontSize: 20,
    textShadowColor: colors.neon,
    textShadowRadius: 8,
  },
}); 