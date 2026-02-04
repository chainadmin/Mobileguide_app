import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, borderRadius } from '../theme';

type EmptyStateProps = {
  title: string;
  message: string;
};

const EmptyState = ({ title, message }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm
  },
  message: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20
  }
});

export default EmptyState;
