import { colors } from '@/theme';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface LifeBarProps {
  lives: number;
  maxLives?: number;
}

const LifeBar: React.FC<LifeBarProps> = ({ lives, maxLives = 3 }) => {
  return (
    <View style={styles.container}>
      {Array.from({ length: maxLives }).map((_, i) => (
        <FontAwesome
          key={i}
          name="heart"
          size={24}
          style={[styles.heart, { color: i < lives ? colors.red : colors.deep }]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  heart: {
    marginHorizontal: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
});

export default LifeBar; 