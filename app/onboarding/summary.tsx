import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

export default function Summary() {
  const router = useRouter();
  const { setUser, name, grade, preferredSubjects = [] } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profieloverzicht</Text>
      <Text style={styles.text}>Naam: {name}</Text>
      <Text style={styles.text}>Klas: {grade}</Text>
      <Text style={styles.text}>Vakken: {preferredSubjects.length > 0 ? preferredSubjects.join(', ') : 'Geen gekozen'}</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.replace('/home')}
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