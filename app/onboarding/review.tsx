import { colors, spacing } from '@/theme';
import { StyleSheet } from 'react-native';

export default function Review() { return null; }

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.l },
  title: { fontSize: 22, color: colors.neon, marginBottom: spacing.l, textAlign: 'center' },
  card: {
    width: '85%',
    borderWidth: 1,
    borderColor: colors.neon,
    padding: spacing.m,
    marginBottom: spacing.l,
  },
  line: { fontSize: 18, color: colors.neon, marginVertical: spacing.xs },
}); 