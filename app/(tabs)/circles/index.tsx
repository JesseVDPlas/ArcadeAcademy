import HUD from '@/components/hud/HUD';
import Screen from '@/components/layout/Screen';
import { Section } from '@/components/shared/Section';
import RetroButton from '@/components/shared/RetroButton';
import { RetroInput } from '@/components/ui/RetroInput';
import { useCircles } from '@/contexts/CirclesContext';
import { useLeaderboard } from '@/contexts/LeaderboardContext';
import { flags } from '@/lib/flags';
import { isoWeekKey } from '@/lib/time';
import { colors, fonts, spacing } from '@/theme';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

const CirclesScreen = () => {
  const router = useRouter();
  const { getMyCircle, createCircle, joinCircle, leaveCircle, hydrated } = useCircles();
  const { getBoard, alias, getCircleWeekBoard } = useLeaderboard();
  const [inviteCode, setInviteCode] = useState('');
  const [circleName, setCircleName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const myCircle = getMyCircle();
  const currentWeekKey = isoWeekKey();
  const circleEntries = myCircle 
    ? getCircleWeekBoard(myCircle.id, currentWeekKey)
    : [];

  useEffect(() => {
    if (!flags.show_non_mvp_tabs) {
      router.replace('/(tabs)/home');
    }
  }, [router]);

  if (!flags.show_non_mvp_tabs) {
    return null;
  }

  // Check if feature is disabled
  if (!flags.circles) {
    return (
      <Screen header={<HUD compact />} padding="m">
        <Section title="Circles">
          <Text style={styles.disabledText}>
            Circles feature is currently disabled.
          </Text>
        </Section>
      </Screen>
    );
  }

  // Check if alias is set
  if (!alias) {
    return (
      <Screen header={<HUD compact />} padding="m">
        <Section title="Circles">
          <Text style={styles.hintText}>
            Je moet eerst een alias instellen voordat je een Circle kunt joinen.
          </Text>
          <RetroButton 
            onPress={() => router.push('/(tabs)/leaderboard')}
            style={styles.button}
          >
            Ga naar Leaderboard
          </RetroButton>
        </Section>
      </Screen>
    );
  }

  // No circle: show join/create flow
  if (!myCircle) {
    const handleJoin = async () => {
      if (!inviteCode.trim()) {
        Alert.alert('Fout', 'Voer een invite code in');
        return;
      }

      setIsJoining(true);
      try {
        const success = joinCircle(inviteCode.trim());
        if (success) {
          setInviteCode('');
          Alert.alert('Succes', 'Je bent toegevoegd aan de Circle!');
        } else {
          Alert.alert('Fout', 'Ongeldige invite code');
        }
      } catch (error) {
        Alert.alert('Fout', error instanceof Error ? error.message : 'Kon niet joinen');
      } finally {
        setIsJoining(false);
      }
    };

    const handleCreate = async () => {
      if (!circleName.trim()) {
        Alert.alert('Fout', 'Voer een Circle naam in');
        return;
      }

      setIsCreating(true);
      try {
        const circleId = createCircle(circleName.trim());
        if (circleId) {
          setCircleName('');
          Alert.alert('Succes', `Circle "${circleName.trim()}" is aangemaakt!`);
        } else {
          Alert.alert('Fout', 'Kon Circle niet aanmaken');
        }
      } catch (error) {
        Alert.alert('Fout', error instanceof Error ? error.message : 'Kon niet aanmaken');
      } finally {
        setIsCreating(false);
      }
    };

    return (
      <Screen header={<HUD compact />} padding="m" scroll>
        <Section title="Circles">
          <Text style={styles.description}>
            Maak of join een Circle om met vrienden te concurreren!
          </Text>

          {/* Join Circle */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Join Circle</Text>
            <Text style={styles.hintText}>
              Vraag een invite code aan een vriend
            </Text>
            <View style={styles.inputRow}>
              <RetroInput
                value={inviteCode}
                onChangeText={setInviteCode}
                placeholder="Invite code"
                size="medium"
                style={styles.input}
              />
              <RetroButton
                onPress={handleJoin}
                disabled={isJoining || !inviteCode.trim()}
                style={styles.actionButton}
              >
                Join
              </RetroButton>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Create Circle */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Create Circle</Text>
            <Text style={styles.hintText}>
              Maak een nieuwe Circle aan
            </Text>
            <View style={styles.inputRow}>
              <RetroInput
                value={circleName}
                onChangeText={setCircleName}
                placeholder="Circle naam"
                size="medium"
                style={styles.input}
                maxLength={30}
              />
              <RetroButton
                onPress={handleCreate}
                disabled={isCreating || !circleName.trim()}
                variant="secondary"
                style={styles.actionButton}
              >
                Create
              </RetroButton>
            </View>
          </View>
        </Section>
      </Screen>
    );
  }

  // In circle: show leaderboard
  const handleShare = () => {
    // For MVP: Show alert with code (can be enhanced with expo-sharing later)
    Alert.alert(
      'Invite Code',
      `Deel deze code met vrienden:\n\n${myCircle.id}\n\n(Kopieer en deel via je favoriete app)`,
      [{ text: 'Oké', style: 'default' }]
    );
  };

  const handleLeave = () => {
    Alert.alert(
      'Circle verlaten?',
      `Weet je zeker dat je "${myCircle.name}" wilt verlaten?`,
      [
        { text: 'Annuleren', style: 'cancel' },
        {
          text: 'Verlaten',
          style: 'destructive',
          onPress: () => {
            leaveCircle();
            Alert.alert('Succes', 'Je hebt de Circle verlaten');
          },
        },
      ]
    );
  };

  const myEntry = circleEntries.find(e => e.alias === alias);
  const myRank = myEntry ? circleEntries.indexOf(myEntry) + 1 : null;

  return (
    <Screen header={<HUD compact />} padding="m" scroll>
      {/* Circle Header */}
      <Section title={myCircle.name}>
        <View style={styles.circleHeader}>
          <View style={styles.circleInfo}>
            <Text style={styles.circleId}>Code: {myCircle.id}</Text>
            <Text style={styles.weekLabel}>Week: {currentWeekKey}</Text>
          </View>
          <View style={styles.headerActions}>
            <RetroButton
              onPress={handleShare}
              size="small"
              variant="secondary"
              style={styles.shareButton}
            >
              📤 Share
            </RetroButton>
            <RetroButton
              onPress={handleLeave}
              size="small"
              variant="secondary"
              style={styles.leaveButton}
            >
              Verlaten
            </RetroButton>
          </View>
        </View>
      </Section>

      {/* Circle Leaderboard */}
      <Section title="Circle Leaderboard">
        {circleEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Nog geen inzendingen deze week
            </Text>
            <Text style={styles.emptyHint}>
              Submit je score in de Leaderboard tab om hier te verschijnen!
            </Text>
          </View>
        ) : (
          <View style={styles.entriesList}>
            {circleEntries.map((entry, index) => {
              const isMe = entry.alias === alias;
              return (
                <View
                  key={`${entry.alias}-${entry.ts}`}
                  style={[styles.entryRow, isMe && styles.entryRowMe]}
                >
                  <Text style={[styles.rank, isMe && styles.rankMe]}>
                    #{index + 1}
                  </Text>
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
        )}
      </Section>

      {/* My Status */}
      {myEntry && (
        <Section title="Jouw Status">
          <View style={styles.myStatusCard}>
            <Text style={styles.myStatusText}>
              Rank: #{myRank} van {circleEntries.length}
            </Text>
            <Text style={styles.myStatusText}>
              Tokens: {myEntry.tokens} 💎
            </Text>
          </View>
        </Section>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  disabledText: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.grey[600],
    textAlign: 'center',
    padding: spacing.m,
  },
  description: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.l,
  },
  formSection: {
    marginBottom: spacing.l,
    gap: spacing.m,
  },
  sectionTitle: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  hintText: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.grey[600],
    marginBottom: spacing.s,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.s,
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  actionButton: {
    margin: 0,
    minWidth: 80,
  },
  button: {
    marginTop: spacing.m,
  },
  divider: {
    height: 1,
    backgroundColor: colors.grey[700],
    marginVertical: spacing.l,
  },
  circleHeader: {
    gap: spacing.m,
  },
  circleInfo: {
    gap: spacing.xs,
  },
  circleId: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.neon,
  },
  weekLabel: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.grey[600],
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.s,
    flexWrap: 'wrap',
  },
  shareButton: {
    margin: 0,
  },
  leaveButton: {
    margin: 0,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.s,
  },
  emptyText: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.grey[600],
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.grey[600],
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  entriesList: {
    gap: spacing.s,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    backgroundColor: colors.cardBg + '40',
    borderRadius: 8,
    gap: spacing.m,
  },
  entryRowMe: {
    backgroundColor: colors.neonGreen + '20',
    borderWidth: 2,
    borderColor: colors.neonGreen,
  },
  rank: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.grey[500],
    minWidth: 30,
  },
  rankMe: {
    color: colors.neonGreen,
    fontWeight: '700',
  },
  alias: {
    flex: 1,
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.white,
  },
  aliasMe: {
    color: colors.neonGreen,
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
    color: colors.neonGreen,
    fontWeight: '700',
  },
  myStatusCard: {
    backgroundColor: colors.cardBg + '60',
    padding: spacing.m,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.neonGreen + '40',
    gap: spacing.s,
  },
  myStatusText: {
    fontFamily: fonts.arcade,
    fontSize: 12,
    color: colors.neonGreen,
  },
});

export default CirclesScreen;
