import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, radii, glows } from '@/theme';
import { BlurView } from 'expo-blur';

export interface GlassPanelProps {
  children: ReactNode;
  /** Padding variant */
  padding?: 'none' | 'small' | 'medium' | 'large';
  /** Show glow border */
  glow?: boolean;
  /** Glow color */
  glowColor?: 'green' | 'purple' | 'pink';
  /** Custom style */
  style?: ViewStyle;
}

/**
 * GlassPanel - Semi-transparent dark purple panel with pixel border
 * Creates a glassmorphism effect for content containers
 */
export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  padding = 'medium',
  glow = true,
  glowColor = 'green',
  style,
}) => {
  const paddingStyles = {
    none: {},
    small: { padding: spacing.s },
    medium: { padding: spacing.m },
    large: { padding: spacing.l },
  };

  const glowStyles = {
    green: glows.small.green,
    purple: glows.small.purple,
    pink: glows.small.pink,
  };

  return (
    <View
      style={[
        styles.container,
        paddingStyles[padding],
        glow && glowStyles[glowColor],
        style,
      ]}
    >
      {/* Blur background for glass effect */}
      <BlurView
        intensity={20}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      
      {/* Content */}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg + 'CC', // 80% opacity
    borderWidth: 2,
    borderColor: colors.neonGreen,
    borderRadius: radii.m,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    position: 'relative',
    zIndex: 1,
  },
});

export default GlassPanel;

