import { colors, fonts } from '@/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import AnimatedReanimated, {
    Easing as ReanimatedEasing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

export type BitByteMood = 'idle' | 'happy' | 'sad';

interface BitByteProps {
  mood: BitByteMood;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * BitByte – tijdelijke placeholder component
 * In een latere iteratie vervangen we de Text door een sprite‑sheet animatie.
 */
export const BitByte: React.FC<BitByteProps> = ({ mood, size = 'lg' }) => {
  const translateY = useSharedValue(-5); // Start from -5 for bounce effect
  const scale = useSharedValue(1);
  const tintOpacity = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const shimmerTranslateX = useSharedValue(-200); // Shimmer position
  
  // React Native Animated values for overlays
  const sparkleOpacityRN = useRef(new Animated.Value(0)).current;
  const sadOpacity = useRef(new Animated.Value(0)).current;

  // Initial bounce effect on mount
  useEffect(() => {
    // Bounce in with spring animation
    translateY.value = withSpring(0, {
      damping: 12,
      stiffness: 150,
      mass: 1,
    });
    
    // Shimmer effect - continuous loop (starts after bounce)
    // Wider range for smoother sweep
    shimmerTranslateX.value = withDelay(
      500, // Wait for bounce to complete
      withRepeat(
        withSequence(
          withTiming(300, { duration: 2500, easing: ReanimatedEasing.linear }),
          withTiming(-200, { duration: 0 }) // Reset instantly
        ),
        -1, // Infinite
        false
      )
    );
  }, []);

  useEffect(() => {
    switch (mood) {
      case 'idle':
        // Lichte y-yo-yo animatie
        translateY.value = withRepeat(
          withSequence(
            withTiming(2, { duration: 1000, easing: ReanimatedEasing.inOut(ReanimatedEasing.sin) }),
            withTiming(-2, { duration: 1000, easing: ReanimatedEasing.inOut(ReanimatedEasing.sin) })
          ),
          -1, // Infinite repeat
          true // Reverse
        );
        scale.value = 1;
        tintOpacity.value = 0;
        sparkleOpacity.value = 0;
        break;

      case 'happy':
        // Scale bounce + sparkle
        scale.value = withSequence(
          withTiming(1.2, { duration: 200 }),
          withTiming(1, { duration: 400 })
        );
        sparkleOpacity.value = withSequence(
          withTiming(1, { duration: 200 }),
          withDelay(400, withTiming(0, { duration: 200 }))
        );
        translateY.value = 0;
        tintOpacity.value = 0;
        
        // React Native Animated sparkle overlay
        sparkleOpacityRN.setValue(0);
        Animated.loop(
          Animated.sequence([
            Animated.timing(sparkleOpacityRN, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(sparkleOpacityRN, { toValue: 0, duration: 400, useNativeDriver: true }),
          ]),
          { iterations: 4 } // 4× twinkel
        ).start();
        break;

      case 'sad':
        // Korte shake + magenta tint
        translateY.value = withSequence(
          withTiming(-3, { duration: 50 }),
          withTiming(3, { duration: 50 }),
          withTiming(-2, { duration: 50 }),
          withTiming(2, { duration: 50 }),
          withTiming(0, { duration: 50 })
        );
        tintOpacity.value = withSequence(
          withTiming(0.4, { duration: 200 }),
          withDelay(300, withTiming(0, { duration: 200 }))
        );
        scale.value = 1;
        sparkleOpacity.value = 0;
        
        // React Native Animated sad overlay
        sadOpacity.setValue(0.6); // 60% tint
        Animated.timing(sadOpacity, { 
          toValue: 0, 
          duration: 1200, 
          easing: Easing.out(Easing.quad), 
          useNativeDriver: true 
        }).start();
        break;
    }
  }, [mood]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ],
  }));

  const tintStyle = useAnimatedStyle(() => ({
    opacity: tintOpacity.value,
  }));

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    // More subtle shimmer that only enhances light parts
    return {
      transform: [{ translateX: shimmerTranslateX.value }],
      opacity: 0.5, // Reduced opacity for subtlety
    };
  });

  const sizeMap = {
    sm: 80,
    md: 100,
    lg: 120,
  };
  const imageSize = sizeMap[size];

  return (
    <View style={styles.container}>
      <AnimatedReanimated.View style={[styles.bitByte, animatedStyle]}>
        <View style={styles.imageContainer}>
          <Image 
            source={require('@/assets/images/bitbyte.png')} 
            style={[styles.bitByteImage, { width: imageSize, height: imageSize }]}
            resizeMode="contain"
          />
          {/* Shimmer overlay - subtle gradient sweep */}
          <AnimatedReanimated.View 
            style={[styles.shimmerContainer, shimmerStyle]} 
            pointerEvents="none"
          >
            <View style={styles.shimmerGradient} />
          </AnimatedReanimated.View>
        </View>
        <AnimatedReanimated.View style={[styles.tint, tintStyle]} />
        
        {/* Happy sparkle overlay */}
        {mood === 'happy' && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sparkleOpacityRN,
            }}
          >
            {/* PNG-sparkle als die bestaat, anders emoji-fallback */}
            {/* <Image source={require('../../assets/images/sparkle.png')} style={{ width: 48, height: 48 }} /> */}
            <Text style={{ fontSize: 32 }}>✨</Text>
          </Animated.View>
        )}
        
        {/* Sad magenta overlay */}
        {mood === 'sad' && (
          <Animated.View 
            style={{ 
              position: 'absolute', 
              top: 0, 
              right: 0, 
              bottom: 0, 
              left: 0, 
              backgroundColor: colors.pink, 
              opacity: sadOpacity, 
              borderRadius: 4 
            }} 
          />
        )}
      </AnimatedReanimated.View>
      <AnimatedReanimated.View style={[styles.sparkle, sparkleStyle]}>
        <Text style={styles.sparkleText}>✨</Text>
      </AnimatedReanimated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  bitByte: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  bitByteImage: {
    // Size is set dynamically via inline style
    zIndex: 1,
  },
  shimmerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 2,
  },
  shimmerGradient: {
    width: 50,
    height: '150%',
    // Very subtle white shimmer - creates highlight effect on light parts only
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transform: [{ skewX: '-25deg' }],
    // Soft white glow that enhances bright areas
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  tint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.pink,
    borderRadius: 8,
  },
  sparkle: {
    position: 'absolute',
    top: -20,
    right: -10,
  },
  sparkleText: {
    fontSize: 24,
  },
});

export default BitByte; 