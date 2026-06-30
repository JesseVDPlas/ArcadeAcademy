/**
 * Demo/Preview file for Phase 1 UI Components
 * Use this for visual testing and Storybook integration
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { XPBar } from './XPBar';
import { StreakPill } from './StreakPill';
import { LivesHearts } from './LivesHearts';
import { TokensPill } from './TokensPill';
import { colors, spacing, typography } from '@/theme';

export const ComponentDemo = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>XPBar Component</Text>
        
        <Text style={styles.label}>Regular (Lv 5, 450/1000 XP)</Text>
        <XPBar current={450} max={1000} level={5} />
        
        <Text style={styles.label}>Compact (Lv 12, 2300/3000 XP)</Text>
        <XPBar current={2300} max={3000} level={12} compact />
        
        <Text style={styles.label}>Near complete (950/1000 XP)</Text>
        <XPBar current={950} max={1000} level={8} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>StreakPill Component</Text>
        
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Small (3 days)</Text>
            <StreakPill count={3} size="small" />
          </View>
          
          <View>
            <Text style={styles.label}>Medium (7 days)</Text>
            <StreakPill count={7} size="medium" />
          </View>
          
          <View>
            <Text style={styles.label}>Large (21 days)</Text>
            <StreakPill count={21} size="large" />
          </View>
        </View>
        
        <Text style={styles.label}>Without animation</Text>
        <StreakPill count={14} animated={false} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>LivesHearts Component</Text>
        
        <View style={styles.column}>
          <Text style={styles.label}>Full lives (5/5)</Text>
          <LivesHearts current={5} max={5} />
          
          <Text style={styles.label}>Partial lives (3/5)</Text>
          <LivesHearts current={3} max={5} />
          
          <Text style={styles.label}>Critical (1/5)</Text>
          <LivesHearts current={1} max={5} />
          
          <Text style={styles.label}>No lives (0/5)</Text>
          <LivesHearts current={0} max={5} />
        </View>
        
        <Text style={styles.label}>Size variants</Text>
        <View style={styles.row}>
          <LivesHearts current={3} max={5} size="small" />
          <LivesHearts current={3} max={5} size="medium" />
          <LivesHearts current={3} max={5} size="large" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TokensPill Component</Text>
        
        <View style={styles.row}>
          <View>
            <Text style={styles.label}>Small (50)</Text>
            <TokensPill count={50} size="small" />
          </View>
          
          <View>
            <Text style={styles.label}>Medium (250)</Text>
            <TokensPill count={250} size="medium" />
          </View>
          
          <View>
            <Text style={styles.label}>Large (1337)</Text>
            <TokensPill count={1337} size="large" />
          </View>
        </View>
        
        <Text style={styles.label}>Without glow</Text>
        <TokensPill count={100} showGlow={false} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Combined Layout Example</Text>
        <Text style={styles.label}>Typical HUD layout</Text>
        
        <View style={styles.hudExample}>
          <View style={styles.hudRow}>
            <TokensPill count={374} size="small" showGlow={false} />
            <LivesHearts current={4} max={5} size="small" />
            <StreakPill count={7} size="small" animated={false} />
          </View>
          
          <XPBar current={850} max={1500} level={8} compact />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDeep,
    padding: spacing.l,
  },
  section: {
    marginBottom: spacing.xl * 2,
  },
  sectionTitle: {
    ...typography.title,
    color: colors.neonGreen,
    marginBottom: spacing.l,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.l,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  column: {
    gap: spacing.m,
  },
  hudExample: {
    backgroundColor: colors.cardBg,
    padding: spacing.m,
    borderRadius: spacing.m,
    gap: spacing.m,
  },
  hudRow: {
    flexDirection: 'row',
    gap: spacing.s,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
});

export default ComponentDemo;

