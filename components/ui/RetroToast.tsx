import { colors, fonts } from '@/theme';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '../../contexts/ToastContext';

const TOAST_HEIGHT = 48;
const ANIMATION_DURATION = 200;

const RetroToast: React.FC = () => {
  const { show } = useToast();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const translateY = React.useRef(new Animated.Value(TOAST_HEIGHT + 32)).current;

  // Listen for showToast calls
  useEffect(() => {
    // Patch: subscribe to ToastContext (simulate event bus)
    (useToast() as any)._setToast = (t: any) => {
      if (t) {
        setToast(t);
        setVisible(true);
        if (t.type === 'error') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        setVisible(false);
      }
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: TOAST_HEIGHT + 32,
        duration: ANIMATION_DURATION,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!toast) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        {
          transform: [{ translateY }],
          bottom: insets.bottom + 32,
          backgroundColor: '#111',
        },
      ]}
    >
      <View style={styles.pixelFrame}>
        <Text
          style={[
            styles.text,
            toast.type === 'success' ? styles.success : styles.error,
          ]}
        >
          {toast.message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  pixelFrame: {
    minWidth: 180,
    maxWidth: Dimensions.get('window').width - 48,
    height: TOAST_HEIGHT,
    backgroundColor: '#111',
    borderWidth: 3,
    borderColor: colors.neon,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    shadowColor: colors.neon,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  text: {
    fontFamily: fonts.arcade,
    fontSize: 16,
    textAlign: 'center',
  },
  success: {
    color: colors.neon,
  },
  error: {
    color: colors.pink,
  },
});

export default RetroToast; 