import { colors } from '@/theme';
import React from 'react';
import { SafeAreaView, StyleSheet, View, ViewProps } from 'react-native';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  style,
  ...props
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.container, style]} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  container: {
    flex: 1,
    padding: 16,
  },
});

export default ScreenWrapper; 