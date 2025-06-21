import ScreenWrapper from '@/components/shared/ScreenWrapper';
import { colors, fonts } from '@/theme';
import { Text } from 'react-native';

export default function RewardsScreen() {
  return (
    <ScreenWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text
        style={{
          color: colors.neon,
          fontFamily: fonts.arcade,
          fontSize: 20,
          marginBottom: 24,
        }}
      >
        Rewards
      </Text>
      <Text
        style={{
          color: '#fff',
          fontFamily: fonts.arcade,
          fontSize: 14,
          textAlign: 'center',
          lineHeight: 24,
        }}
      >
        Here you will find your earned badges, XP, and other rewards soon!
      </Text>
    </ScreenWrapper>
  );
} 