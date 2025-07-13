import { colors, fonts } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

const levels = ['MAVO', 'HAVO', 'VWO'];

export default function Level() {
  const router = useRouter();
  const { setLevel } = useUser();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kies je niveau</Text>
      <View style={styles.options}>
        {levels.map((level) => {
          const isSelected = selected === level;
          return (
            <Pressable
              key={level}
              style={[styles.option, isSelected && styles.selected]}
              onPress={() => setSelected(level)}
            >
              <Text style={[styles.optionText, isSelected && styles.selectedText]}>{level}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={[styles.button, !selected && { opacity: 0.5 }]}
        disabled={!selected}
        onPress={() => {
          if (selected) {
            setLevel(selected);
            router.replace('/onboarding/goal');
          }
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
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 },
  option: { borderColor: colors.neon, borderWidth: 2, borderRadius: 10, padding: 16, margin: 8, backgroundColor: '#111' },
  selected: { backgroundColor: colors.neon },
  optionText: { color: colors.neon, fontSize: 18, fontFamily: fonts.arcade },
  selectedText: { color: colors.selectedText, fontFamily: fonts.arcade },
  button: { backgroundColor: '#111', borderColor: colors.neon, borderWidth: 2, borderRadius: 10, padding: 16 },
  buttonText: { color: colors.neon, fontSize: 18, fontFamily: fonts.arcade, fontWeight: 'bold' },
}); 