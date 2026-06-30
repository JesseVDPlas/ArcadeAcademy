import { colors, fonts, spacing, radii, glows } from '@/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface SegmentedOption {
  label: string;
  value: string;
}

export interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}

/**
 * Segmented control - arcade-style pill selector
 */
export const Segmented: React.FC<SegmentedProps> = ({
  options,
  value,
  onChange,
}) => {
  const activeIndex = options.findIndex(opt => opt.value === value);
  const segmentWidth = 100 / options.length;

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.segment,
              isActive && styles.segmentActive,
              { width: `${segmentWidth}%` },
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBg,
    borderRadius: radii.l,
    padding: 4,
    borderWidth: 2,
    borderColor: colors.neonGreen + '40',
    gap: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: radii.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.neonGreen,
    ...glows.small.green,
  },
  segmentText: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.grey[500],
  },
  segmentTextActive: {
    color: colors.textOnAccent,
    fontWeight: '700',
  },
});

export default Segmented;

