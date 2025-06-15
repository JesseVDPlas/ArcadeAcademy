import { RetroButton } from '@/components/shared/RetroButton';
import { colors, fonts, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <Image
          source={require('@/assets/images/bitbyte.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>ARCADE ACADEMY</Text>
        <RetroButton style={styles.button} onPress={() => router.push('/home')}>
          Start
        </RetroButton>
        <RetroButton style={styles.button} onPress={() => router.push('/settings')}>
          Instellingen
        </RetroButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.dark,
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
  },
  button: {
    width: 200,
    marginVertical: spacing.s,
  },
}); 