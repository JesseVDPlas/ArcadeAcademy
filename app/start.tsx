import { RetroButton } from '@/components/shared/RetroButton';
import { useUser } from '@/contexts/UserContext';
import { isOnboardingComplete } from '@/lib/onboarding';
import { colors, coreStyles, fonts, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();
  const { soundOn, toggleSound, name, grade, level } = useUser();
  const completed = isOnboardingComplete({ name, grade, level });
  const ctaTarget = completed ? '/(tabs)/home' : '/onboarding/intro';

  React.useEffect(() => {
    if (completed) return;
    const timeout = setTimeout(() => {
      router.replace('/onboarding/intro');
    }, 500);
    return () => clearTimeout(timeout);
  }, [completed, router]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Image
          source={require('@/assets/images/bitbyte.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>ARCADE ACADEMY</Text>
        <RetroButton
          testID="start-cta"
          style={styles.button}
          variant="primary"
          size="large"
          onPress={() => router.replace(ctaTarget)}
        >
          {completed ? 'CONTINUE' : 'START'}
        </RetroButton>
        <TouchableOpacity style={styles.muteBtn} onPress={toggleSound}>
          <Ionicons
            name={soundOn ? 'volume-high' : 'volume-mute'}
            size={28}
            color={soundOn ? colors.neon : colors.pink}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: coreStyles.screenBg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.l,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: spacing.l,
  },
  title: {
    color: colors.neon,
    fontFamily: fonts.arcade,
    fontSize: 24,
    marginBottom: spacing.l,
    letterSpacing: 2,
    textShadowColor: colors.pink,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textAlign: 'center',
  },
  button: {
    width: 300,
    minHeight: 56,
    marginVertical: spacing.s,
  },
  muteBtn: {
    marginTop: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 
