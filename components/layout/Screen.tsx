import { colors, spacing } from '@/theme';
import React, { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle, Platform, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenProps {
  children: ReactNode;
  header?: ReactNode;
  padding?: 'none' | 's' | 'm' | 'l';
  scroll?: boolean;
  style?: ViewStyle;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  header,
  padding = 'm',
  scroll = false,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const paddingValue = padding === 'none' ? 0 : spacing[padding];
  
  if (scroll) {
    return (
      <SafeAreaView style={[styles.container, style]} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        {header && <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? spacing.xs : 0 }]}>{header}</View>}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { padding: paddingValue },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          bounces={true}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, style]} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {header && <View style={[styles.headerContainer, { paddingTop: insets.top > 0 ? spacing.xs : 0 }]}>{header}</View>}
      <View style={[styles.content, { padding: paddingValue }]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  headerContainer: {
    // Header takes natural height and stays above content.
    zIndex: 10,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    ...(Platform.OS === 'ios' && {
      paddingBottom: spacing.xl, // Extra padding for iOS bounce
    }),
  },
});

export default Screen;
