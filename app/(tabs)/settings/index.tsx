import Body from '@/components/ui/Body';
import Segmented from '@/components/ui/Segmented';
import Screen from '@/components/layout/Screen';
import Title from '@/components/ui/Title';
import { useUser } from '@/contexts/UserContext';
import type { QuizSpeed } from '@/lib/quizTiming';
import { colors, spacing } from '@/theme';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

export default function SettingsScreen() {
  const { soundOn, hapticsOn, showXpChip, quizSpeed, livesRegen, setSettings, setLivesRegen } = useUser();

  return (
    <Screen header={null} padding="m">
      <Title style={styles.sectionTitle}>Instellingen</Title>

      <View style={styles.settingsGroup}>
        <SettingRow
          label="Geluid"
          value={soundOn}
          onValueChange={(v) => setSettings({ soundOn: v })}
        />
        <SettingRow
          label="Haptics (trillen)"
          value={hapticsOn}
          onValueChange={(v) => setSettings({ hapticsOn: v })}
        />
        <SettingRow
          label="Toon +XP chip"
          value={showXpChip}
          onValueChange={(v) => setSettings({ showXpChip: v })}
        />
      </View>

      <View style={{ height: spacing.l }} />

      <Title style={styles.sectionTitle}>Quiz snelheid</Title>
      <Body style={styles.description}>
        Bepaalt hoe lang correct antwoord + uitleg in beeld blijft.
      </Body>
      <Segmented
        options={[
          { label: 'SLOW', value: 'slow' },
          { label: 'NORMAL', value: 'normal' },
          { label: 'FAST', value: 'fast' },
        ]}
        value={quizSpeed}
        onChange={(value) => setSettings({ quizSpeed: value as QuizSpeed })}
      />

      <View style={{ height: spacing.xl }} />

      <Title style={styles.sectionTitle}>Experimenteel</Title>
      <Body style={styles.description}>
        Levens regenereren automatisch (+1 per 20 minuten, tot max 5).
      </Body>
      <SettingRow
        label="Lives regeneratie"
        value={livesRegen}
        onValueChange={(v) => setLivesRegen(v)}
      />
    </Screen>
  );
}

function SettingRow({ 
  label, 
  value, 
  onValueChange 
}: { 
  label: string; 
  value: boolean; 
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <Body style={styles.label}>{label}</Body>
      <Switch 
        value={value} 
        onValueChange={onValueChange}
        trackColor={{ false: colors.grey[700], true: colors.neon + '40' }}
        thumbColor={value ? colors.neon : colors.grey[400]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    marginBottom: spacing.m,
    color: colors.neon,
  },
  settingsGroup: {
    gap: spacing.m,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.s,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  description: {
    color: '#CCCCCC',
    marginBottom: spacing.s,
    fontSize: 14,
  },
});
