import ScreenWrapper from '@/components/shared/ScreenWrapper';
import { colors, fonts } from '@/theme';
import { Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScreenWrapper style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: colors.neon, fontFamily: fonts.arcade, fontSize: 20 }}>
        PROFILE
      </Text>
    </ScreenWrapper>
  );
} 