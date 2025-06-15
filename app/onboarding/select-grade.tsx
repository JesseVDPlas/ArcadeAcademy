import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

const YEARS = ['1', '2', '3', '4', '5', '6'];

export default function SelectGrade() {
  const router = useRouter();
  const { user, setUser } = useUser();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kies je leerjaar</Text>
      {YEARS.map(year => (
        <Pressable
          key={year}
          style={styles.button}
          onPress={() => {
            setUser({ ...user, tempYear: year });
            router.push('/onboarding/select-level' as any);
          }}
        >
          <Text style={styles.buttonText}>{year}</Text>
        </Pressable>
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#39FF14', fontSize: 24, fontFamily: 'ArcadeFont', marginBottom: 24 },
  button: { backgroundColor: '#111', borderColor: '#39FF14', borderWidth: 2, borderRadius: 10, padding: 16, margin: 8 },
  buttonText: { color: '#39FF14', fontSize: 18, fontFamily: 'ArcadeFont', fontWeight: 'bold' },
}); 