import { RetroInput } from '@/components/ui/RetroInput';
import { colors, coreStyles, fonts, radii, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

export default function Name() {
  const router = useRouter();
  const { setName } = useUser();
  const [name, setNameInput] = useState('');

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/bitbyte.png')}
        style={styles.bitbyte}
        resizeMode="contain"
      />
      <Text style={styles.title}>Wat is je naam?</Text>
      <RetroInput
        value={name}
        onChangeText={setNameInput}
        placeholder="Naam"
        size="large"
        style={styles.input}
      />
      <Pressable
        style={styles.button}
        disabled={!name.trim()}
        onPress={() => {
          const trimmed = name.trim();
          setName(trimmed);
          router.replace('/onboarding/level');
        }}
      >
        <Text style={styles.buttonText}>Volgende</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: coreStyles.screenBg, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  bitbyte: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl,
  },
  title: { color: colors.neonGreen, fontSize: 24, fontFamily: fonts.arcade, marginBottom: spacing.xl, textAlign: 'center' },
  input: { width: 280, marginBottom: spacing.xl, textAlign: 'center' },
  button: {
    backgroundColor: coreStyles.buttonBg,
    borderColor: coreStyles.buttonBorder,
    borderWidth: 1,
    borderRadius: radii.m,
    padding: spacing.l,
  },
  buttonText: { color: colors.neonGreen, fontSize: 18, fontFamily: fonts.arcade, fontWeight: 'bold' },
});
