import { colors, fonts } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../../contexts/UserContext';

const getGradesForLevel = (level?: string) => {
  if (level === 'MAVO') return ['1', '2', '3', '4'];
  if (level === 'HAVO') return ['1', '2', '3', '4', '5'];
  if (level === 'VWO') return ['1', '2', '3', '4', '5', '6'];
  return ['1', '2', '3', '4', '5', '6']; // fallback
};

export default function Grade() {
  const router = useRouter();
  const { setGrade, level } = useUser();
  const grades = getGradesForLevel(level);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>In welk leerjaar zit je?</Text>
      <View style={styles.options}>
        {grades.map((grade) => {
          const isSelected = selected === grade;
          return (
            <Pressable
              key={grade}
              style={[styles.option, isSelected && styles.selected]}
              onPress={() => setSelected(grade)}
            >
              <Text style={[styles.optionText, isSelected && styles.selectedText]}>{grade}</Text>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={[styles.button, !selected && { opacity: 0.5 }]}
        disabled={!selected}
        onPress={() => {
          if (selected) {
            setGrade(selected);
            router.replace('/onboarding/level');
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
  input: {
    width: '80%',
    height: 50,
    borderColor: colors.neon,
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    color: colors.neon,
    fontSize: 18,
    fontFamily: fonts.arcade,
    marginBottom: 24,
    backgroundColor: '#111',
  },
}); 