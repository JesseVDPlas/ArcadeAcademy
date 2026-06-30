import { GlassPanel } from '@/components/ui/GlassPanel';
import { colors, fonts, spacing } from '@/theme';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface SectionHeaderProps {
  title?: string;
  right?: ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, right }) => {
  if (!title && !right) return null;

  // Center title if no right element, otherwise space-between
  const headerStyle = right ? styles.header : styles.headerCentered;

  return (
    <View style={headerStyle}>
      {title && <Text style={styles.title}>{title}</Text>}
      {right && <View style={styles.right}>{right}</View>}
    </View>
  );
};

interface DividerProps {
  subtle?: boolean;
}

export const Divider: React.FC<DividerProps> = ({ subtle = false }) => {
  return <View style={[styles.divider, subtle && styles.dividerSubtle]} />;
};

interface SectionProps {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  /** Use glass panel effect */
  glass?: boolean;
  /** Glass panel glow color */
  glowColor?: 'green' | 'purple' | 'pink';
}

export const Section: React.FC<SectionProps> = ({ 
  title, 
  right, 
  children, 
  glass = true,
  glowColor = 'green',
}) => {
  const content = (
    <>
      <SectionHeader title={title} right={right} />
      {children}
    </>
  );

  if (glass) {
    return (
      <View style={styles.section}>
        <GlassPanel padding="medium" glow glowColor={glowColor}>
          {content}
        </GlassPanel>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.l,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  headerCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  title: {
    fontFamily: fonts.arcade,
    fontSize: 16,
    color: colors.white,
    textAlign: 'center', // Keep centered for section titles (visual hierarchy)
  },
  right: {
    // Right slot container
  },
  divider: {
    height: 1,
    backgroundColor: colors.neon,
    alignSelf: 'stretch',
    marginVertical: spacing.l,
    opacity: 1,
  },
  dividerSubtle: {
    opacity: 0.6,
  },
});

export default Section;

