import { colors, fonts } from '@/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export type BitByteMood = 'idle' | 'happy' | 'sad';

interface BitByteProps {
  mood: BitByteMood;
}

/**
 * BitByte – tijdelijke placeholder component
 * In een latere iteratie vervangen we de Text door een sprite‑sheet animatie.
 */
export const BitByte: React.FC<BitByteProps> = ({ mood }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{`BitByte is ${mood}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  text: {
    fontFamily: fonts.arcade,
    color: colors.neon,
  },
});

export default BitByte; 