import { Icon } from '@/lib/icons';
import { colors, fonts, spacing, radii, glows } from '@/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal, Pressable } from 'react-native';

export interface ActionSheetItem {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

export interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  items: ActionSheetItem[];
  title?: string;
}

/**
 * ActionSheet - Bottom sheet modal for secondary actions
 * Simple implementation using Modal (no external libs)
 */
export const ActionSheet: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  items,
  title,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.container}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheet}>
              {title && (
                <View style={styles.header}>
                  <Text style={styles.title}>{title}</Text>
                </View>
              )}
              <View style={styles.itemsContainer}>
                {items.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.item,
                      item.disabled && styles.itemDisabled,
                    ]}
                    onPress={() => {
                      if (!item.disabled) {
                        item.onPress();
                        onClose();
                      }
                    }}
                    disabled={item.disabled}
                    activeOpacity={0.7}
                  >
                    <Icon
                      name={item.icon as any}
                      size={24}
                      color={item.disabled ? colors.grey[600] : colors.neonGreen}
                    />
                    <Text
                      style={[
                        styles.itemLabel,
                        item.disabled && styles.itemLabelDisabled,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {!item.disabled && (
                      <Icon
                        name="chevron-right"
                        size={20}
                        color={colors.grey[600]}
                        style={styles.chevron}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: radii.l,
    borderTopRightRadius: radii.l,
    borderWidth: 2,
    borderColor: colors.neonGreen,
    borderBottomWidth: 0,
    ...glows.medium.green,
    paddingBottom: spacing.l,
  },
  header: {
    padding: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.grey[700],
  },
  title: {
    fontFamily: fonts.arcade,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center',
  },
  itemsContainer: {
    paddingVertical: spacing.s,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.m,
    gap: spacing.m,
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemLabel: {
    flex: 1,
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.white,
  },
  itemLabelDisabled: {
    color: colors.grey[600],
  },
  chevron: {
    marginLeft: 'auto',
  },
  cancelButton: {
    marginTop: spacing.s,
    marginHorizontal: spacing.m,
    padding: spacing.m,
    backgroundColor: colors.grey[700],
    borderRadius: radii.m,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.white,
  },
});

export default ActionSheet;

