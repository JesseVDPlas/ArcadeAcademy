import { colors, fonts } from '@/theme';
import React, { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface LevelUpNotificationProps {
  isVisible: boolean;
  newLevel: number;
  onClose: () => void;
}

export const LevelUpNotification: React.FC<LevelUpNotificationProps> = ({
  isVisible,
  newLevel,
  onClose,
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.5));

  useEffect(() => {
    if (isVisible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!isVisible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        }
      ]}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎉</Text>
          </View>
          <Text style={styles.title}>Level Up!</Text>
          <Text style={styles.levelText}>Je bent nu level {newLevel}</Text>
          <Text style={styles.bonusText}>+50 tokens bonus!</Text>
          <Pressable style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>Geweldig!</Text>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#111',
    borderWidth: 2,
    borderColor: colors.neon,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    maxWidth: 300,
    width: '80%',
  },
  iconContainer: {
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    color: colors.neon,
    fontSize: 24,
    fontFamily: fonts.arcade,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  levelText: {
    color: colors.neon,
    fontSize: 18,
    fontFamily: fonts.arcade,
    marginBottom: 8,
  },
  bonusText: {
    color: colors.green,
    fontSize: 16,
    fontFamily: fonts.arcade,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: colors.neon,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  closeButtonText: {
    color: colors.deep,
    fontSize: 16,
    fontFamily: fonts.arcade,
    fontWeight: 'bold',
  },
});

export default LevelUpNotification; 