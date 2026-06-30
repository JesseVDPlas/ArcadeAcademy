import RetroButton from '@/components/shared/RetroButton';
import { Icon, actionIcons } from '@/lib/icons';
import { colors, fonts, spacing, radii } from '@/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useUser, SubjectId } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';

export const HomeQuickActions: React.FC = () => {
  const router = useRouter();
  const { dailyChallenge, runSession, subjectsUnlocked } = useUser();
  const { show: showToast } = useToast();

  const handleDailyChallenge = () => {
    const { order, progress } = dailyChallenge;
    
    // Find first 'current' subject
    const currentSubject = order.find(subjectId => progress[subjectId] === 'current');
    
    if (!currentSubject) {
      // All done
      showToast('Daily is vandaag voltooid 🎉', 'success');
      return;
    }

    // Navigate to quiz with daily params
    router.push({
      pathname: '/(tabs)/quiz/[subject]',
      params: {
        subject: currentSubject,
        daily: '1',
        dailySubjectId: currentSubject,
      },
    });
  };

  const handleContinue = () => {
    // If active session, continue that
    if (runSession.active && runSession.subjectId) {
      const params: any = {
        subject: runSession.subjectId,
      };
      
      if (runSession.daily) {
        params.daily = '1';
        params.dailySubjectId = runSession.subjectId;
      }

      router.push({
        pathname: '/(tabs)/quiz/[subject]',
        params,
      });
      return;
    }

    // Otherwise: find last played or first unlocked
    // For now, use first unlocked subject as fallback
    if (subjectsUnlocked) {
      const firstSubject: SubjectId = 'hist'; // Default fallback
      router.push({
        pathname: '/(tabs)/quiz/[subject]',
        params: { subject: firstSubject },
      });
    } else {
      showToast('Voltooi eerst de intro om te spelen', 'error');
    }
  };

  return (
    <View style={styles.container}>
      <RetroButton
        onPress={handleDailyChallenge}
        size="large"
        style={styles.button}
      >
        <View style={styles.buttonContent}>
          <Icon name={actionIcons.daily} size={24} color={colors.neon} />
          <Text style={styles.buttonText}>Daily Challenge</Text>
        </View>
      </RetroButton>

      <RetroButton
        onPress={handleContinue}
        size="large"
        variant="secondary"
        style={styles.button}
      >
        <View style={styles.buttonContent}>
          <Icon name={actionIcons.continue} size={24} color={colors.electricPurple} />
          <Text style={styles.buttonText}>Doorgaan</Text>
        </View>
      </RetroButton>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.m,
    marginBottom: spacing.l,
  },
  button: {
    width: '100%',
    margin: 0,
    minHeight: 60,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.m,
  },
  buttonText: {
    fontFamily: fonts.arcade,
    fontSize: 16,
    color: colors.neon,
  },
});

export default HomeQuickActions;

