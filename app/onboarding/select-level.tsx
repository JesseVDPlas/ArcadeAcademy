import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

const LEVELS = [
  { label: 'VWO', value: 'vwo' },
  { label: 'HAVO', value: 'havo' },
  { label: 'VMBO-T', value: 'vmbo-t' },
];

export default function SelectLevel() {
  const router = useRouter();
  const { user, setUser, saveUserToStorage } = useUser();
  const year = user?.tempYear;

  useEffect(() => {
    if (!year) {
      router.replace('/onboarding/select-grade');
    }
  }, [year, router]);

  if (!year) {
    return null;
  }

  // Filter niveaus op basis van leerjaar
  const availableLevels = LEVELS.filter(level => {
    if (level.value === 'vwo') return true;
    if (level.value === 'havo' && Number(year) <= 5) return true;
    if (level.value === 'vmbo-t' && Number(year) <= 4) return true;
    return false;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kies je niveau</Text>
      {availableLevels.map(level => (
        <Pressable
          key={level.value}
          style={styles.button}
          onPress={async () => {
            setUser({
              ...user,
              grade: `${year} ${level.value}`,
              tempYear: undefined,
            });
            await saveUserToStorage();
            router.replace('/home');
          }}
        >
          <Text style={styles.buttonText}>{level.label}</Text>
        </Pressable>
      ))}
      <Pressable style={[styles.button, { marginTop: 32 }]} onPress={() => {
        setUser({ ...user, tempYear: undefined });
        router.replace('/onboarding/select-grade');
      }}>
        <Text style={styles.buttonText}>← Terug</Text>
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#39FF14', fontSize: 24, fontFamily: 'ArcadeFont', marginBottom: 24 },
  button: { backgroundColor: '#111', borderColor: '#39FF14', borderWidth: 2, borderRadius: 10, padding: 16, margin: 8 },
  buttonText: { color: '#39FF14', fontSize: 18, fontFamily: 'ArcadeFont', fontWeight: 'bold' },
}); 