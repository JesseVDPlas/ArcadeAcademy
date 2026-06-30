import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Image, ViewStyle } from 'react-native';
import { colors, typography, spacing, radii, glows } from '@/theme';
import { RetroButton } from '@/components/shared/RetroButton';

export interface DialogBoxProps {
  /** Dialog message/text */
  message: string;
  /** BitByte image (optional, shows default if not provided) */
  bitByteImage?: any;
  /** Show continue button */
  showContinue?: boolean;
  /** Continue button text */
  continueText?: string;
  /** On continue callback */
  onContinue?: () => void;
  /** Custom style */
  style?: ViewStyle;
}

/**
 * DialogBox - Classic RPG-style text box for BitByte dialogs
 * Pixel border, dark background, BitByte avatar on the left
 */
export const DialogBox: React.FC<DialogBoxProps> = ({
  message,
  bitByteImage,
  showContinue = true,
  continueText = 'Continue',
  onContinue,
  style,
}) => {
  const defaultBitByte = require('@/assets/images/bitbyte.png');

  return (
    <View style={[styles.container, style]}>
      {/* BitByte avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={bitByteImage || defaultBitByte}
          style={styles.avatar}
          resizeMode="contain"
        />
      </View>

      {/* Dialog content */}
      <View style={styles.content}>
        {/* Message text */}
        <View style={styles.messageContainer}>
          <Text style={styles.message}>{message}</Text>
        </View>

        {/* Continue button */}
        {showContinue && (
          <View style={styles.buttonContainer}>
            <RetroButton
              size="small"
              variant="secondary"
              onPress={onContinue}
              style={styles.button}
            >
              {continueText}
            </RetroButton>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderWidth: 3,
    borderColor: colors.neonGreen,
    borderRadius: radii.m,
    padding: spacing.m,
    gap: spacing.m,
    ...glows.medium.green,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    gap: spacing.m,
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  button: {
    minWidth: 100,
  },
});

export default DialogBox;

