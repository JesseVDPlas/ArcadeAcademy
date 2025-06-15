import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function OnboardingIntro() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welkom bij Arcade Academy!</Text>
      <View style={styles.centered}>
        <Image
          source={require('../../assets/images/bitbyte.png')}
          style={styles.sprite}
          resizeMode="contain"
        />
      </View>
      <Text style={styles.subtitle}>BitByte is je quizmentor. Klaar om te beginnen?</Text>
      <Pressable style={styles.button} onPress={() => router.push('/onboarding/select-grade')}>
        <Text style={styles.buttonText}>Start</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#39FF14',
    fontSize: 28,
    fontFamily: 'ArcadeFont',
    marginBottom: 24,
    textAlign: 'center',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 2,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  sprite: {
    width: 180,
    height: 180,
    marginBottom: 8,
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    shadowOpacity: 0.7,
  },
  subtitle: {
    color: '#39FF14',
    fontSize: 20,
    fontFamily: 'Courier', // Vervang door pixel font als beschikbaar
    marginBottom: 48,
    textAlign: 'center',
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#111',
    borderColor: '#39FF14',
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  buttonText: {
    color: '#39FF14',
    fontSize: 20,
    fontFamily: 'ArcadeFont',
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: '#FF00FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
}); 