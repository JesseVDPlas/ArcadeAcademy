import React from 'react';
import { StyleSheet, View } from 'react-native';

interface XPBarProps {
  score: number; // 0-5
}

export default function XPBar({ score }: XPBarProps) {
  const percent = Math.max(0, Math.min(score, 5)) * 20;
  return (
    <View style={styles.outer}>
      <View style={styles.inner}>
        <View style={[styles.fill, { width: `${percent}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: '#222',
    padding: 4,
    borderWidth: 4,
    borderColor: '#39FF14',
    borderRadius: 0,
    alignItems: 'flex-start',
    width: 260,
    marginBottom: 24,
    // pixel effect
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowOpacity: 1,
  },
  inner: {
    width: 240,
    height: 24,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#39FF14',
    borderRadius: 0,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  fill: {
    height: '100%',
    backgroundColor: '#39FF14',
    borderRadius: 0,
    // pixel effect
    shadowColor: '#39FF14',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
    shadowOpacity: 1,
  },
}); 