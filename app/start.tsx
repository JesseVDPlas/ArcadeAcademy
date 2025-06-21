import { RetroButton } from '@/components/shared/RetroButton';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();
  const { soundOn, toggleSound } = useUser();

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
          style={styles.button}
          onPress={() => router.replace('/onboarding/name')}
        >
          Start
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
  input: {
    width: 220,
    borderWidth: 2,
    borderColor: colors.neon,
    borderRadius: 10,
    color: colors.neon,
    fontFamily: fonts.arcade,
    fontSize: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: spacing.m,
    backgroundColor: '#111',
    textAlign: 'center',
    letterSpacing: 1,
  },
  button: {
    width: 200,
    marginVertical: spacing.s,
  },
  muteBtn: {
    marginTop: spacing.l,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 