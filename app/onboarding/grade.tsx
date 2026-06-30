import { colors, coreStyles, fonts, radii, spacing } from '@/theme';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!level?.trim()) {
      router.replace('/onboarding/level');
    }
  }, [level, router]);

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
  container: { flex: 1, backgroundColor: coreStyles.screenBg, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.neonGreen, fontSize: 24, fontFamily: fonts.arcade, marginBottom: spacing.xl },
  options: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: spacing.xl },
  option: {
    borderColor: colors.neonGreen,
    borderWidth: 1,
    borderRadius: radii.m,
    padding: spacing.l,
    margin: spacing.s,
    backgroundColor: coreStyles.buttonBg,
  },
  selected: { backgroundColor: colors.neonGreen },
  optionText: { color: colors.neonGreen, fontSize: 18, fontFamily: fonts.arcade },
  selectedText: { color: colors.selectedText, fontFamily: fonts.arcade },
  button: {
    backgroundColor: coreStyles.buttonBg,
    borderColor: coreStyles.buttonBorder,
    borderWidth: 1,
    borderRadius: radii.m,
    padding: spacing.l,
  },
  buttonText: { color: colors.neonGreen, fontSize: 18, fontFamily: fonts.arcade, fontWeight: 'bold' },
  input: {
    width: '80%',
    height: 50,
    borderColor: colors.neonGreen,
    borderWidth: 2,
    borderRadius: radii.m,
    paddingHorizontal: 10,
    color: colors.neonGreen,
    fontSize: 18,
    fontFamily: fonts.arcade,
    marginBottom: spacing.xl,
    backgroundColor: coreStyles.buttonBg,
  },
});
