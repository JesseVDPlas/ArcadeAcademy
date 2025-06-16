import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

export default function SetName() {
  const router = useRouter();
  const { setUser } = useUser();
  const [name, setName] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wat is je naam?</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Naam"
        placeholderTextColor="#39FF14"
      />
      <Pressable
        style={styles.button}
        onPress={() => {
          setUser({ name: name.trim() });
          router.replace('/home');
        }}
        disabled={!name}
      >
        <Text style={styles.buttonText}>Volgende</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#39FF14', fontSize: 24, fontFamily: 'ArcadeFont', marginBottom: 24 },
  input: { borderColor: '#39FF14', borderWidth: 2, borderRadius: 10, color: '#39FF14', fontSize: 18, fontFamily: 'ArcadeFont', padding: 12, marginBottom: 24, width: 220, backgroundColor: '#111' },
  button: { backgroundColor: '#111', borderColor: '#39FF14', borderWidth: 2, borderRadius: 10, padding: 16 },
  buttonText: { color: '#39FF14', fontSize: 18, fontFamily: 'ArcadeFont', fontWeight: 'bold' },
}); 