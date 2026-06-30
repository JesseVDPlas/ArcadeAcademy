import { Platform, AccessibilityInfo } from 'react-native';

// HSL-inspired semantic color system
// Note: React Native requires hex/rgba, but we maintain HSL-like structure
export const colors = {
  // Primary palette (HSL-inspired naming)
  neonGreen: '#39FF14',      // hsl(109, 100%, 54%) - primary accent
  electricPurple: '#9D4EDD', // hsl(280, 66%, 59%) - secondary accent  
  hotPink: '#FF38CE',        // hsl(320, 100%, 61%) - tertiary accent
  bgDeep: '#1B0044',         // hsl(258, 100%, 13%) - main background
  cardBg: '#2A1A4A',         // hsl(258, 44%, 20%) - card background
  
  // Semantic aliases
  primary: '#39FF14',
  secondary: '#9D4EDD',
  tertiary: '#FF38CE',
  background: '#1B0044',
  surface: '#2A1A4A',
  
  // Functional colors
  success: '#39FF14',
  error: '#FF3062',
  warning: '#FFB627',
  info: '#4EA8FF',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B4B4B4',
  textOnAccent: '#0B001C',
  
  // Grayscale
  white: '#FFFFFF',
  black: '#000000',
  grey: {
    50: '#F9F9F9',
    100: '#F0F0F0',
    200: '#E0E0E0',
    300: '#CCCCCC',
    400: '#999999',
    500: '#808080',
    600: '#666666',
    700: '#4D4D4D',
    800: '#333333',
    900: '#1A1A1A',
  },
  
  // Legacy aliases (backwards compatibility)
  neon: '#39FF14',
  deep: '#1B0044',
  pink: '#FF38CE',
  red: '#FF3062',
  dark: '#0B001C',
  green: '#39FF14',
  selectedText: '#0B001C',
  selectedTextAlt: '#000000',
};

export const spacing = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 24,
};

export const radii = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
};

export const coreStyles = {
  screenBg: colors.dark,
  cardBg: colors.cardBg,
  cardBorder: `${colors.neonGreen}55`,
  cardBorderSoft: `${colors.neonGreen}35`,
  primaryText: colors.textPrimary,
  titleText: colors.neonGreen,
  secondaryText: colors.textSecondary,
  buttonBg: `${colors.bgDeep}CC`,
  buttonBorder: colors.neonGreen,
};

// Legacy alias for backwards compatibility
export const radius = { pixel: 4 };

export const fonts = {
  // Primary font for titles, buttons, scores (pixel/arcade aesthetic)
  arcade: 'PressStart2P', // Press Start 2P loaded in _layout.tsx
  arcadeFallback: 'ArcadeFont', // Legacy alias (same font, different name)
  
  // Body text (system fonts for readability)
  body: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  
  // Monospace for code/numbers
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),
};

export const typography = {
  // Display styles (arcade font)
  display: {
    fontFamily: fonts.arcade,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  
  // Title styles (arcade font)
  title: {
    fontFamily: fonts.arcade,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
  },
  
  titleLarge: {
    fontFamily: fonts.arcade,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0,
  },
  
  titleSmall: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
  },
  
  // Body styles (system font for readability)
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  
  bodyLarge: {
    fontFamily: fonts.body,
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  
  bodySmall: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  
  // Button/label styles (arcade font)
  button: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    textTransform: 'uppercase' as const,
  },
  
  // Caption/meta text
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
};

// Glow/shadow utilities (three intensity levels)
export const glows = {
  small: {
    green: {
      shadowColor: colors.neonGreen,
      shadowOpacity: 0.6,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    },
    purple: {
      shadowColor: colors.electricPurple,
      shadowOpacity: 0.6,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    },
    pink: {
      shadowColor: colors.hotPink,
      shadowOpacity: 0.6,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    },
  },
  
  medium: {
    green: {
      shadowColor: colors.neonGreen,
      shadowOpacity: 0.7,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 2 },
      elevation: 6,
    },
    purple: {
      shadowColor: colors.electricPurple,
      shadowOpacity: 0.7,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 2 },
      elevation: 6,
    },
    pink: {
      shadowColor: colors.hotPink,
      shadowOpacity: 0.7,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 2 },
      elevation: 6,
    },
  },
  
  strong: {
    green: {
      shadowColor: colors.neonGreen,
      shadowOpacity: 0.9,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 4 },
      elevation: 10,
    },
    purple: {
      shadowColor: colors.electricPurple,
      shadowOpacity: 0.9,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 4 },
      elevation: 10,
    },
    pink: {
      shadowColor: colors.hotPink,
      shadowOpacity: 0.9,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 4 },
      elevation: 10,
    },
  },
};

// Legacy shadow alias (backwards compatibility)
export const shadows = {
  neon: {
    green: glows.medium.green,
    pink: glows.medium.pink,
  },
};

// Animation configuration
export const animations = {
  // Duration presets
  durations: {
    instant: 0,
    fast: 150,
    normal: 250,
    slow: 400,
    verySlow: 600,
  },
  
  // Easing curves
  easings: {
    easeOut: [0.25, 0.1, 0.25, 1] as const,
    easeIn: [0.42, 0, 1, 1] as const,
    easeInOut: [0.42, 0, 0.58, 1] as const,
    linear: [0, 0, 1, 1] as const,
  },
  
  // Spring presets for Reanimated
  springs: {
    gentle: {
      damping: 20,
      stiffness: 90,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 100,
      mass: 1,
    },
    stiff: {
      damping: 26,
      stiffness: 200,
      mass: 1,
    },
  },
};

// Accessibility utilities
let reduceMotionEnabled = false;

// Check for reduced motion preference
AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
  reduceMotionEnabled = enabled ?? false;
});

export const getAnimationDuration = (baseDuration: number): number => {
  return reduceMotionEnabled ? 0 : baseDuration;
};

export const shouldReduceMotion = (): boolean => {
  return reduceMotionEnabled;
}; 
