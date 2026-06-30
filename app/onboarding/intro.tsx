import { DialogBox } from '@/components/ui/DialogBox';
import { colors, coreStyles, fonts, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function OnboardingIntro() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const messages = [
    'Welkom bij Arcade Academy! Ik ben BitByte, je quizmentor.',
    'We leren spelenderwijs. Elke quiz levert XP en tokens op.',
    'Voltooi daily challenges om je streak te behouden.',
    "Klaar om te beginnen? Laten we je profiel instellen!",
  ];

  const handleContinue = () => {
    if (step < messages.length - 1) {
      setStep(step + 1);
    } else {
      router.push('/onboarding/name');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ARCADE ACADEMY</Text>
      <DialogBox
        message={messages[step]}
        continueText={step === messages.length - 1 ? "Start!" : "Volgende"}
        onContinue={handleContinue}
        style={styles.dialog}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: coreStyles.screenBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    color: colors.neonGreen,
    fontSize: 28,
    fontFamily: fonts.arcade,
    marginBottom: spacing.xl,
    textAlign: 'center',
    textShadowColor: colors.hotPink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  dialog: {
    marginTop: spacing.xl,
    maxWidth: '90%',
  },
});
