import { LivesHearts } from '@/components/ui/LivesHearts';
import { StreakPill } from '@/components/ui/StreakPill';
import { TokensPill } from '@/components/ui/TokensPill';
import { XPBar } from '@/components/ui/XPBar';
import { useSound } from '@/contexts/SoundContext';
import { useTokens } from '@/contexts/TokenContext';
import { useUser } from '@/contexts/UserContext';
import { colors, typography, spacing, radii, glows } from '@/theme';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

export interface HUDProps {
  /** Compact variant for status strip */
  compact?: boolean;
  /** Size variant */
  size?: 'xs' | 'small' | 'medium' | 'large';
}

export const HUD: React.FC<HUDProps> = ({ compact = false, size = 'medium' }) => {
  const { name, userLevel, xp, getXPProgress, lives, streak: streakState, showXpChip } = useUser();
  const streak = streakState?.current || 0;
  const { balance: tokens } = useTokens();
  const { play: playSound } = useSound();
  const [isNarrow, setIsNarrow] = useState(Dimensions.get('window').width < 360);
  const [showXPChip, setShowXPChip] = useState(false);
  const [xpDelta, setXPDelta] = useState(0);
  const [triggerGlow, setTriggerGlow] = useState(false);
  const chipOpacity = useRef(new Animated.Value(0)).current;
  const prevXP = useRef(xp);
  const prevLevel = useRef(userLevel);
  const prevLives = useRef(lives);
  const isMounted = useRef(false);
  const chipActiveRef = useRef(false);
  
  const xpProgress = getXPProgress();
  // Calculate max XP for current level (current + next = total needed for this level)
  const xpMax = xpProgress.current + xpProgress.next;

  // Mark as mounted after first render
  useEffect(() => {
    isMounted.current = true;
    prevXP.current = xp;
    prevLevel.current = userLevel;
    prevLives.current = lives;

    return () => {
      chipActiveRef.current = false;
    };
  }, [xp, userLevel, lives]);

  // Detect XP increase and show +XP chip (throttled)
  useEffect(() => {
    // Skip on initial mount or if chip already showing
    if (!isMounted.current) return;
    if (chipActiveRef.current) return; // Throttle: ignore new chips while one is showing
    
    if (xp > prevXP.current && xp - prevXP.current > 0) {
      const delta = xp - prevXP.current;
      setXPDelta(delta);
      setShowXPChip(true);
      chipActiveRef.current = true;
      
      // Fade in/out animation
      chipOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(chipOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(1200),
        Animated.timing(chipOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowXPChip(false);
        chipActiveRef.current = false; // Allow new chips after animation completes
      });
    }
    
    prevXP.current = xp;
  }, [xp, chipOpacity]);

  // Detect level up
  useEffect(() => {
    // Skip on initial mount
    if (!isMounted.current) return;
    
    if (userLevel > prevLevel.current) {
      playSound('levelup');
      setTriggerGlow(true);
      setTimeout(() => setTriggerGlow(false), 800);
    }
    
    prevLevel.current = userLevel;
  }, [userLevel, playSound]);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setIsNarrow(width < 360);
  };

  // Compact variant for status strip
  if (compact) {
    return (
      <View style={[styles.container, styles.compactContainer]} onLayout={handleLayout}>
        <View style={styles.compactTopRow}>
          <XPBar 
            current={xpProgress.current}
            max={xpMax}
            level={userLevel}
            showGlow={triggerGlow}
            compact
          />
        </View>
        <View style={styles.compactBottomRow}>
          <View style={styles.compactStatCell}>
            <TokensPill count={tokens} size="small" showGlow={false} />
          </View>
          <View style={styles.compactStatCell}>
            <StreakPill count={streak} size="small" animated={streak > 0} />
          </View>
          <View style={styles.compactStatCell}>
            <LivesHearts 
              current={lives} 
              max={5} 
              size="small"
              onLivesLost={lives < prevLives.current}
            />
          </View>
        </View>
      </View>
    );
  }

  if (isNarrow) {
    // Narrow layout: stacked
    return (
      <View style={styles.container} onLayout={handleLayout}>
        {/* Row 1: Name + Level */}
        <View style={styles.row}>
          <Text style={styles.nameSmall} numberOfLines={1}>
            {name || 'PLAYER'}
          </Text>
          <Text style={styles.levelSmall}>Lv {userLevel}</Text>
        </View>
        
        {/* Row 2: XP Bar with floating chip */}
        <View style={styles.xpRow}>
          <View style={styles.xpBarWrapper}>
            <XPBar 
              current={xpProgress.current}
              max={xpMax}
              level={userLevel}
              showGlow={triggerGlow}
              compact
            />
            {showXpChip && showXPChip && (
              <Animated.View 
                style={[
                  styles.xpChip, 
                  { opacity: chipOpacity },
                  isNarrow ? styles.xpChipNarrow : styles.xpChipWide
                ]} 
                pointerEvents="none"
              >
                <Text style={styles.xpChipText}>+{xpDelta} XP</Text>
              </Animated.View>
            )}
          </View>
        </View>

        {/* Row 3: Tokens + Streak + Lives */}
        <View style={styles.row}>
          <TokensPill count={tokens} size="small" showGlow={false} />
          <StreakPill count={streak} size="small" animated={streak > 0} />
          <LivesHearts 
            current={lives} 
            max={5} 
            size="small"
            onLivesLost={lives < prevLives.current}
          />
        </View>
      </View>
    );
  }

  // Wide layout: horizontal
  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Name + Level */}
      <View style={styles.nameContainer}>
        <Text style={styles.name} numberOfLines={1}>
          {name || 'PLAYER'}
        </Text>
        <Text style={styles.level}>Lv {userLevel}</Text>
      </View>
      
      {/* XP Bar (flex: 1) */}
      <View style={styles.xpContainer}>
        <View style={styles.xpBarWrapper}>
          <XPBar 
            current={xpProgress.current}
            max={xpMax}
            level={userLevel}
            showGlow={triggerGlow}
            compact
          />
          {showXpChip && showXPChip && (
            <Animated.View style={[styles.xpChip, { opacity: chipOpacity }]} pointerEvents="none">
              <Text style={styles.xpChipText}>+{xpDelta} XP</Text>
            </Animated.View>
          )}
        </View>
      </View>
      
      {/* Stats: Tokens + Streak + Lives */}
      <View style={styles.statsRow}>
        <TokensPill count={tokens} size="small" showGlow={false} />
        <StreakPill count={streak} size="small" animated={streak > 0} />
        <LivesHearts 
          current={lives} 
          max={5} 
          size="small"
          onLivesLost={lives < prevLives.current}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBg,
    marginHorizontal: spacing.s,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    borderWidth: 1,
    borderColor: `${colors.neonGreen}40`,
    borderRadius: radii.m,
    ...glows.small.green,
  },
  compactContainer: {
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.s,
    minHeight: 68,
    gap: spacing.xs,
  },
  compactTopRow: {
    width: '100%',
  },
  compactBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    width: '100%',
    minHeight: 28,
    gap: spacing.xs,
  },
  compactStatCell: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 84,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexWrap: 'wrap',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
  },
  xpRow: {
    width: '100%',
  },
  xpContainer: {
    flex: 1,
    minWidth: 150,
  },
  xpBarWrapper: {
    position: 'relative',
  },
  xpChip: {
    position: 'absolute',
    backgroundColor: `${colors.neonGreen}D9`,
    borderRadius: radii.xs,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: colors.neonGreen,
    zIndex: 1000,
    ...glows.small.green,
  },
  xpChipNarrow: {
    top: -36,
    alignSelf: 'center',
  },
  xpChipWide: {
    top: -36,
    right: spacing.s,
  },
  xpChipText: {
    ...typography.titleSmall,
    fontSize: 11,
    color: colors.textOnAccent,
    fontWeight: '700',
    textShadowColor: colors.black,
    textShadowRadius: 2,
    textShadowOffset: { width: 0, height: 1 },
  },
  name: {
    ...typography.titleSmall,
    fontSize: 10,
    color: colors.neonGreen,
    maxWidth: 120,
  },
  nameSmall: {
    ...typography.titleSmall,
    fontSize: 9,
    color: colors.neonGreen,
    maxWidth: 100,
  },
  level: {
    ...typography.titleSmall,
    fontSize: 11,
    color: colors.textPrimary,
  },
  levelSmall: {
    ...typography.titleSmall,
    fontSize: 9,
    color: colors.textPrimary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.s,
    flexWrap: 'wrap',
  },
});

export default HUD;
