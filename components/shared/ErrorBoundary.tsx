import { colors, fonts, spacing } from '@/theme';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Oops!</Text>
            <Text style={styles.message}>
              Er is iets fout gegaan. Probeer de app opnieuw te starten.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{this.state.error.toString()}</Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.l,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.l,
  },
  title: {
    fontFamily: fonts.arcade,
    fontSize: 24,
    color: colors.pink,
    marginBottom: spacing.m,
    textAlign: 'center',
  },
  message: {
    fontFamily: fonts.arcade,
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorBox: {
    marginTop: spacing.l,
    padding: spacing.m,
    backgroundColor: '#ff000020',
    borderWidth: 1,
    borderColor: colors.pink,
    borderRadius: 8,
  },
  errorText: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: colors.pink,
  },
});

export default ErrorBoundary;




