import { colors } from '@/theme';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface LifeBarProps {
  lives: number;
  maxLives?: number;
  size?: 'sm' | 'md';
}

const LifeBar: React.FC<LifeBarProps> = ({ lives, maxLives = 3, size = 'md' }) => {
  const heartSize = size === 'sm' ? 12 : 24;
  const spacing = size === 'sm' ? 2 : 4;

  return (
    <View style={styles.container}>
      {Array.from({ length: maxLives }).map((_, i) => (
        <FontAwesome
          key={i}
          name="heart"
          size={heartSize}
          style={[styles.heart, { marginHorizontal: spacing, color: i < lives ? colors.red : colors.deep }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heart: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});

export default LifeBar; 