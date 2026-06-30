import RetroButton from '@/components/shared/RetroButton';
import { colors, fonts, radii, spacing } from '@/theme';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  primaryText: string;
  onPrimary: () => void;
  secondaryText?: string;
  onSecondary?: () => void;
  secondaryDisabled?: boolean;
  cancelText?: string;
  onCancel: () => void;
}

export default function ConfirmModal({
  visible,
  title,
  message,
  primaryText,
  onPrimary,
  secondaryText,
  onSecondary,
  secondaryDisabled = false,
  cancelText = 'Annuleren',
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <RetroButton onPress={onPrimary} size="large" style={styles.actionButton}>
              {primaryText}
            </RetroButton>
            {secondaryText ? (
              <RetroButton
                onPress={onSecondary}
                size="large"
                variant="secondary"
                style={styles.actionButton}
                disabled={secondaryDisabled}
              >
                {secondaryText}
              </RetroButton>
            ) : null}
            <RetroButton onPress={onCancel} size="large" variant="ghost" style={styles.actionButton}>
              {cancelText}
            </RetroButton>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: `${colors.neonGreen}55`,
    borderRadius: radii.m,
    padding: spacing.l,
    gap: spacing.m,
  },
  title: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.neonGreen,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  actions: {
    gap: spacing.s,
  },
  actionButton: {
    width: '100%',
    margin: 0,
  },
});

