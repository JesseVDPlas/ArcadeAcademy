import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

export default function Summary() {
  const router = useRouter();
  const { user, saveUserToStorage } = useUser();

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profieloverzicht</Text>
      <Text style={styles.text}>Naam: {user.name}</Text>
      <Text style={styles.text}>Klas: {user.grade}</Text>
      <Pressable
        style={styles.button}
        onPress={async () => {
          await saveUserToStorage();
          router.replace('/home');
        }}
      >
        <Text style={styles.buttonText}>Start!</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#39FF14', fontSize: 24, fontFamily: 'ArcadeFont', marginBottom: 24 },
  text: { color: '#39FF14', fontSize: 18, fontFamily: 'ArcadeFont', marginBottom: 12 },
  button: { backgroundColor: '#111', borderColor: '#39FF14', borderWidth: 2, borderRadius: 10, padding: 16, marginTop: 32 },
  buttonText: { color: '#39FF14', fontSize: 18, fontFamily: 'ArcadeFont', fontWeight: 'bold' },
}); 