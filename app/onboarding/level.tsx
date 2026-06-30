import { colors, coreStyles, fonts, radii, spacing } from '@/theme';
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
            router.replace('/onboarding/grade');
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
});
