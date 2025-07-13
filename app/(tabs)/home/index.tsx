import LevelMap from '@/components/home/LevelMap';
import LifeBar from '@/components/shared/LifeBar';
import BitByte from '@/components/ui/BitByte';
import { XPBar } from '@/components/ui/XPBar';
import { useUser } from '@/contexts/UserContext';
import { colors, fonts, radius, spacing } from '@/theme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const HomeScreen = () => {
  const router = useRouter();
  const { name, xp, lives, tokens } = useUser();

  // Voorbeeld: XP nodig voor volgend level
  const xpForNextLevel = 1000;

  return (
    <SafeAreaView style={styles.container}>
      <LevelMap />

      <View style={styles.statsRow}>
        <View style={styles.xpContainer}>
          <Text style={styles.xpLabel}>
            XP: {xp} / {xpForNextLevel}
          </Text>
          <XPBar progress={xp / xpForNextLevel} />
        </View>
        <LifeBar lives={lives} maxLives={5} />
      </View>

      <View style={styles.mainContent}>
        <BitByte mood="idle" />
        <View style={styles.tokenContainer}>
          <FontAwesome name="diamond" size={24} color={colors.neon} />
          <Text style={styles.tokenText}>{tokens}</Text>
        </View>
      </View>

      <View style={styles.placeholderSection}>
        <Text style={styles.placeholderText}>Achievements coming soon... 🔒</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    padding: spacing.m,
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: spacing.m,
    paddingHorizontal: spacing.s,
  },
  xpContainer: {
    flex: 1,
    marginRight: spacing.m,
  },
  xpLabel: {
    fontFamily: fonts.arcade,
    color: colors.white,
    marginBottom: spacing.s,
    fontSize: 12,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00000040',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radius.pixel,
    marginTop: spacing.l,
    borderWidth: 1,
    borderColor: colors.neon,
  },
  tokenText: {
    fontFamily: fonts.arcade,
    color: colors.neon,
    fontSize: 20,
    marginLeft: spacing.m,
  },
  placeholderSection: {
    padding: spacing.m,
    alignItems: 'center',
  },
  placeholderText: {
    fontFamily: fonts.arcade,
    color: '#ffffff80',
    fontSize: 14,
  },
});

export default HomeScreen; 