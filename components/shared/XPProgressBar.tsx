import { colors, fonts } from '@/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface XPProgressBarProps {
  currentXP: number;
  currentLevel: number;
  xpProgress: number;
  xpForNextLevel: number;
  showDetails?: boolean;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  currentXP,
  currentLevel,
  xpProgress,
  xpForNextLevel,
  showDetails = true,
}) => {
  return (
    <View style={styles.container}>
      {showDetails && (
        <View style={styles.header}>
          <Text style={styles.levelText}>Level {currentLevel}</Text>
          <Text style={styles.xpText}>{currentXP} XP</Text>
        </View>
      )}
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${xpProgress * 100}%` }
            ]} 
          />
        </View>
        {showDetails && (
          <Text style={styles.nextLevelText}>
            {xpForNextLevel - currentXP} XP naar level {currentLevel + 1}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#111',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neon,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    color: colors.neon,
    fontSize: 16,
    fontFamily: fonts.arcade,
    fontWeight: 'bold',
  },
  xpText: {
    color: colors.neon,
    fontSize: 14,
    fontFamily: fonts.arcade,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.neon,
    borderRadius: 4,
  },
  nextLevelText: {
    color: colors.neon,
    fontSize: 12,
    fontFamily: fonts.arcade,
    opacity: 0.8,
  },
});

export default XPProgressBar; 