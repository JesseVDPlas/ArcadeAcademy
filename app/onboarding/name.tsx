import { colors, fonts } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

export default function Name() {
  const router = useRouter();
  const { setName } = useUser();
  const [name, setNameInput] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wat is je naam?</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setNameInput}
        placeholder="Naam"
        placeholderTextColor={colors.neon}
      />
      <Pressable
        style={styles.button}
        disabled={!name.trim()}
        onPress={() => {
          const trimmed = name.trim();
          setName(trimmed);
          router.replace('/onboarding/grade');
        }}
      >
        <Text style={styles.buttonText}>Volgende</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.neon, fontSize: 24, fontFamily: fonts.arcade, marginBottom: 24 },
  input: { borderColor: colors.neon, borderWidth: 2, borderRadius: 10, color: colors.neon, fontSize: 18, fontFamily: fonts.arcade, padding: 12, marginBottom: 24, width: 220, backgroundColor: '#111' },
  button: { backgroundColor: '#111', borderColor: colors.neon, borderWidth: 2, borderRadius: 10, padding: 16 },
  buttonText: { color: colors.neon, fontSize: 18, fontFamily: fonts.arcade, fontWeight: 'bold' },
}); 