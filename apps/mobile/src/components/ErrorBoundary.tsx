import { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, spacing } from '../theme';

type Props = {
  children: ReactNode;
  // Changing this value clears a caught error (e.g. pass the current route).
  resetKey?: unknown;
};

type State = {
  error: Error | null;
};

/**
 * In a release build, an error thrown while rendering any screen unmounts
 * the whole React tree, and React Native turns that into a fatal crash.
 * This boundary catches it and shows a "try again" screen instead.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Caught render error:', error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>This screen hit a problem. Please try again.</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={this.reset}
          accessibilityRole="button"
        >
          <Text style={styles.buttonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm
  },
  message: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 8
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  }
});
