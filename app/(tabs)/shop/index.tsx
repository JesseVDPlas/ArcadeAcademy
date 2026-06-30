import HUD from '@/components/hud/HUD';
import Screen from '@/components/layout/Screen';
import RetroButton from '@/components/shared/RetroButton';
import { useTokens } from '@/contexts/TokenContext';
import { useUser } from '@/contexts/UserContext';
import { flags } from '@/lib/flags';
import { logEvent } from '@/lib/analytics';
import { colors, fonts, spacing } from '@/theme';
import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ShopScreen = () => {
  const { balance, canAfford, spend } = useTokens();
  const { addLives, addStreakProtectionPass } = useUser();

  const handleBuyExtraLives = () => {
    if (!canAfford(25)) {
      logEvent('shop_purchase_fail', { item: 'extra_life_pack', reason: 'insufficient_balance' });
      return;
    }

    try {
      spend(25, 'extra_life_pack');
      addLives(3);
      logEvent('token_spent', { amount: 25, reason: 'extra_life_pack' });
      logEvent('shop_purchase_success', { item: 'extra_life_pack', cost: 25 });
    } catch (error) {
      if (__DEV__) console.error('[Shop] Failed to buy extra lives:', error);
      logEvent('shop_purchase_fail', { item: 'extra_life_pack', error: String(error) });
    }
  };

  const handleBuyStreakProtection = () => {
    if (!canAfford(75)) {
      logEvent('shop_purchase_fail', { item: 'streak_protection', reason: 'insufficient_balance' });
      return;
    }

    try {
      spend(75, 'streak_protection');
      addStreakProtectionPass(1);
      logEvent('token_spent', { amount: 75, reason: 'streak_protection' });
      logEvent('shop_purchase_success', { item: 'streak_protection', cost: 75 });
    } catch (error) {
      if (__DEV__) console.error('[Shop] Failed to buy streak protection:', error);
      logEvent('shop_purchase_fail', { item: 'streak_protection', error: String(error) });
    }
  };

  React.useEffect(() => {
    logEvent('shop_view');
  }, []);

  return (
    <Screen header={<HUD compact />} padding="m" scroll>
      <View style={styles.container}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Balance:</Text>
          <View style={styles.balanceValue}>
            <FontAwesome name="diamond" size={16} color={colors.neon} />
            <Text style={styles.balanceText}>{balance}</Text>
          </View>
        </View>

        <View style={styles.itemsContainer}>
          {/* Extra Lives Pack */}
          <View style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>Extra lives (3)</Text>
              <View style={styles.itemPrice}>
                <FontAwesome name="diamond" size={14} color={colors.neon} />
                <Text style={styles.itemPriceText}>25</Text>
              </View>
            </View>
            <Text style={styles.itemDescription}>Krijg 3 extra levens om verder te spelen</Text>
            <RetroButton
              onPress={handleBuyExtraLives}
              disabled={!canAfford(25)}
              style={styles.buyButton}
            >
              {canAfford(25) ? 'Kopen' : 'Niet genoeg 💎'}
            </RetroButton>
          </View>

          {/* Streak Protection */}
          <View style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle}>Streak protection</Text>
              <View style={styles.itemPrice}>
                <FontAwesome name="diamond" size={14} color={colors.neon} />
                <Text style={styles.itemPriceText}>75</Text>
              </View>
            </View>
            <Text style={styles.itemDescription}>
              Bescherm je streak: overslaan van 1 dag reset je streak niet
            </Text>
            <RetroButton
              onPress={handleBuyStreakProtection}
              disabled={!canAfford(75)}
              style={styles.buyButton}
            >
              {canAfford(75) ? 'Kopen' : 'Niet genoeg 💎'}
            </RetroButton>
          </View>

          {/* Future items (disabled) */}
          {flags.cosmetics && (
            <View style={[styles.itemCard, styles.disabledCard]}>
              <Text style={styles.itemTitle}>BitByte cosmetic</Text>
              <Text style={styles.itemDescription}>Coming soon...</Text>
            </View>
          )}

          {flags.themes && (
            <View style={[styles.itemCard, styles.disabledCard]}>
              <Text style={styles.itemTitle}>Profile theme</Text>
              <Text style={styles.itemDescription}>Coming soon...</Text>
            </View>
          )}
        </View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.l,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.deep,
    padding: spacing.m,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neon + '30',
  },
  balanceLabel: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.white,
  },
  balanceValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  balanceText: {
    fontFamily: fonts.arcade,
    fontSize: 16,
    color: colors.neon,
  },
  itemsContainer: {
    gap: spacing.m,
  },
  itemCard: {
    backgroundColor: colors.deep,
    padding: spacing.m,
    borderRadius: spacing.xs,
    borderWidth: 1,
    borderColor: colors.neon + '30',
    gap: spacing.s,
  },
  disabledCard: {
    opacity: 0.5,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.neon,
  },
  itemPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemPriceText: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.neon,
  },
  itemDescription: {
    fontFamily: fonts.arcade,
    fontSize: 10,
    color: colors.grey[600],
    lineHeight: 14,
  },
  buyButton: {
    marginTop: spacing.xs,
  },
});

export default ShopScreen;







