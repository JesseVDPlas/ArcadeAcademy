import RetroButton from '@/components/shared/RetroButton';
import { fonts } from '@/theme';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NotFoundScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🚫 404 — Route not found</Text>
      <RetroButton onPress={() => router.replace('/(tabs)/home')} style={{ marginTop: 32 }}>
        Ga naar Home
      </RetroButton>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 20, color: '#FF00FF', fontFamily: fonts.arcade },
});
