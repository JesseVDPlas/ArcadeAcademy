import HUD from '@/components/hud/HUD';
import Screen from '@/components/layout/Screen';
import { Section } from '@/components/shared/Section';
import RetroButton from '@/components/shared/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import { Segmented, SegmentedOption } from '@/components/ui/Segmented';
import { StatusPill } from '@/components/ui/StatusPill';
import { useCircles } from '@/contexts/CirclesContext';
import { useLeaderboard, useLeaderboardPeriod, LeaderboardPeriod } from '@/contexts/LeaderboardContext';
import { useToast } from '@/contexts/ToastContext';
import { flags } from '@/lib/flags';
import { isoWeekKey, isoMonthKey } from '@/lib/time';
import { colors, fonts, spacing } from '@/theme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

const PERIOD_OPTIONS: SegmentedOption[] = [
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'All-time', value: 'all_time' },
];

const LeaderboardScreen = () => {
  const router = useRouter();
  const { setAlias, validateAlias, computeWeeklyTokens, submitWeekly, fetchWeekly, getBoard, getCooldownRemaining, hydrated } = useLeaderboard();
  const { getMyCircle } = useCircles();
  const { show: showToast } = useToast();
  const [aliasInput, setAliasInput] = useState('');
  const [aliasError, setAliasError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>('weekly');
  const [weeklyEntries, setWeeklyEntries] = useState<any[]>([]);

  const board = getBoard();
  const weeklyTokens = computeWeeklyTokens();
  const cooldownRemaining = getCooldownRemaining();
  
  // Get period data from TokenContext history
  const periodRows = useLeaderboardPeriod(activePeriod);
  const top10Rows = useMemo(() => periodRows.slice(0, 10), [periodRows]);

  useEffect(() => {
    if (!flags.show_non_mvp_tabs) {
      router.replace('/(tabs)/home');
    }
  }, [router]);

  useEffect(() => {
    if (hydrated && flags.leaderboard && activePeriod === 'weekly') {
      loadWeeklyEntries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, activePeriod]);

  if (!flags.show_non_mvp_tabs) {
    return null;
  }

  const loadWeeklyEntries = async () => {
    const fetched = await fetchWeekly();
    setWeeklyEntries(fetched.slice(0, 10)); // Top 10
  };

  const handleSetAlias = () => {
    const trimmed = aliasInput.trim();
    if (!trimmed) {
      setAliasError('Please enter an alias');
      return;
    }

    const validation = validateAlias(trimmed);
    if (!validation.valid) {
      setAliasError(validation.error || 'Invalid alias');
      return;
    }

    try {
      setAlias(trimmed);
      showToast('Alias set!', 'success');
      setAliasInput('');
      setAliasError(null);
    } catch (error) {
      setAliasError(error instanceof Error ? error.message : 'Failed to set alias');
    }
  };

  const handleSubmit = async () => {
    if (!board.alias) {
      showToast('Please set an alias first', 'error');
      return;
    }
    
    if (cooldownRemaining !== null) {
      showToast(`Please wait ${cooldownRemaining} more minute${cooldownRemaining > 1 ? 's' : ''}`, 'error');
      return;
    }

    try {
      await submitWeekly();
      await loadWeeklyEntries();
      showToast('Submitted to leaderboard!', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to submit', 'error');
    }
  };

  const getPeriodLabel = (): string => {
    const now = new Date();
    switch (activePeriod) {
      case 'weekly':
        return `Weekly (${isoWeekKey(now)})`;
      case 'monthly': {
        const monthKey = isoMonthKey(now);
        const [year, month] = monthKey.split('-');
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        const monthName = monthNames[parseInt(month) - 1];
        return `${monthName} ${year}`;
      }
      case 'all_time':
        return 'All-time';
      default:
        return '';
    }
  };

  // Use weekly entries for weekly period (from submit), periodRows for monthly/all-time
  const displayEntries = activePeriod === 'weekly' ? weeklyEntries : top10Rows;
  const isWeekly = activePeriod === 'weekly';

  if (!flags.leaderboard) {
    return (
      <Screen header={<HUD compact />} padding="m">
        <Section title="Leaderboard">
          <Text style={styles.disabledText}>Leaderboard is currently disabled.</Text>
        </Section>
      </Screen>
    );
  }

  return (
    <Screen header={<HUD compact />} padding="m" scroll>
      <View style={styles.container}>
        {/* Segmented Control */}
        <View style={styles.segmentedContainer}>
          <Segmented
            options={PERIOD_OPTIONS}
            value={activePeriod}
            onChange={(value) => setActivePeriod(value as LeaderboardPeriod)}
          />
        </View>

        {/* Period Label */}
        <Section title={getPeriodLabel()}>
          <Text style={styles.periodSubtitle}>Top 10 · {activePeriod === 'weekly' ? 'Weekly' : activePeriod === 'monthly' ? 'Monthly' : 'All-time'}</Text>
        </Section>

        {/* Alias Form - Only for Weekly */}
        {isWeekly && !board.alias && (
          <View style={styles.aliasForm}>
            <Text style={styles.label}>Set your alias:</Text>
            <Text style={styles.hintText}>3-16 characters, A-Z, 0-9, _, - only</Text>
            <View style={styles.inputRow}>
              <RetroInput
                value={aliasInput}
                onChangeText={(text) => {
                  setAliasInput(text);
                  setAliasError(null);
                }}
                placeholder="Enter alias"
                maxLength={16}
                error={!!aliasError}
                size="medium"
                style={styles.input}
              />
              <RetroButton onPress={handleSetAlias} style={styles.setButton}>
                Set
              </RetroButton>
            </View>
            {aliasError && (
              <Text style={styles.errorText}>{aliasError}</Text>
            )}
          </View>
        )}

        {/* Alias Display - Only for Weekly */}
        {isWeekly && board.alias && (
          <View style={styles.aliasDisplay}>
            <Text style={styles.label}>Your alias: {board.alias}</Text>
          </View>
        )}

        {/* Tokens Display - Only for Weekly */}
        {isWeekly && (
          <View style={styles.tokensDisplay}>
            <FontAwesome name="diamond" size={16} color={colors.neon} />
            <Text style={styles.tokensText}>Your weekly tokens: {weeklyTokens}</Text>
          </View>
        )}

        {/* Circle Info - Only for Weekly */}
        {isWeekly && flags.circles && (() => {
          const myCircle = getMyCircle();
          return myCircle ? (
            <Text style={styles.circleInfo}>
              Circle: {myCircle.name}
            </Text>
          ) : (
            <Text style={styles.circleInfo}>
              (Geen circle)
            </Text>
          );
        })()}

        {/* Submit Button - Only for Weekly */}
        {isWeekly && board.alias && (
          <View style={styles.submitContainer}>
            <RetroButton
              onPress={handleSubmit}
              disabled={cooldownRemaining !== null}
              style={styles.submitButton}
            >
              Submit to Board
            </RetroButton>
            {cooldownRemaining !== null && (
              <StatusPill
                type="cooldown"
                message={`Cooldown: ${cooldownRemaining} min${cooldownRemaining > 1 ? 's' : ''} remaining`}
                countdown={cooldownRemaining}
              />
            )}
          </View>
        )}

        {/* Leaderboard List */}
        <Section title="Rankings">
          {displayEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nog geen entries in deze periode.</Text>
            </View>
          ) : (
            <>
              <View style={styles.entriesList}>
                {displayEntries.map((entry, index) => {
                  const isMe = entry.alias === board.alias || (activePeriod !== 'weekly' && entry.alias === 'You');
                  return (
                    <View
                      key={`${entry.alias}-${entry.ts}-${index}`}
                      style={[styles.entryRow, isMe && styles.entryRowMe]}
                    >
                      <Text style={[styles.rank, isMe && styles.rankMe]}>#{index + 1}</Text>
                      <Text style={[styles.alias, isMe && styles.aliasMe]} numberOfLines={1}>
                        {entry.alias}
                        {isMe && ' (Jij)'}
                      </Text>
                      <View style={styles.tokensRow}>
                        <FontAwesome name="diamond" size={12} color={colors.neon} />
                        <Text style={[styles.tokensValue, isMe && styles.tokensValueMe]}>
                          {entry.tokens}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
              {activePeriod === 'weekly' && (
                <Text style={styles.tiebreakerHint}>
                  Tiebreaker: earliest submission wins
                </Text>
              )}
            </>
          )}
        </Section>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.l,
  },
  segmentedContainer: {
    marginBottom: spacing.m,
  },
  periodSubtitle: {
    fontFamily: fonts.body, // System font for subtitles
    fontSize: 11,
    color: colors.grey[500],
    marginTop: spacing.xs,
  },
  disabledText: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.grey[600],
    textAlign: 'center',
    padding: spacing.m,
  },
  aliasForm: {
    gap: spacing.s,
  },
  label: {
    fontFamily: fonts.body, // System font for body text
    fontSize: 12,
    color: colors.white,
  },
  hintText: {
    fontFamily: fonts.body, // System font for hints
    fontSize: 10,
    color: colors.grey[600],
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.s,
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  errorText: {
    fontFamily: fonts.arcade,
    fontSize: 9,
    color: colors.red,
  },
  setButton: {
    margin: 0,
  },
  aliasDisplay: {
    padding: spacing.s,
    backgroundColor: colors.deep,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neon + '30',
  },
  tokensDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    padding: spacing.m,
    backgroundColor: colors.deep,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neon + '30',
  },
  tokensText: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.neon,
  },
  circleInfo: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.grey[600],
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  submitContainer: {
    gap: spacing.xs,
  },
  submitButton: {
    margin: 0,
  },
  cooldownText: {
    fontFamily: fonts.arcade,
    fontSize: 9,
    color: colors.grey[600],
    textAlign: 'center',
  },
  entriesList: {
    gap: spacing.xs,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.s,
    backgroundColor: colors.deep,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neon + '30',
    gap: spacing.s,
  },
  entryRowMe: {
    backgroundColor: colors.neon + '20',
    borderColor: colors.neon,
  },
  rank: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.grey[600],
    width: 30,
  },
  rankMe: {
    color: colors.neon,
    fontWeight: '700',
  },
  alias: {
    flex: 1,
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.white,
  },
  aliasMe: {
    color: colors.neon,
    fontWeight: '700',
  },
  tokensRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tokensValue: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.neon,
  },
  tokensValueMe: {
    fontWeight: '700',
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.body, // System font for body text
    fontSize: 12,
    color: colors.grey[500],
    textAlign: 'center',
  },
  tiebreakerHint: {
    fontFamily: fonts.body, // System font for hints
    fontSize: 10,
    color: colors.grey[500],
    textAlign: 'center',
    marginTop: spacing.s,
    fontStyle: 'italic',
  },
});

export default LeaderboardScreen;
