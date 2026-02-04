import { StyleSheet, Text, View } from 'react-native';

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
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#161821',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  title: {
    color: '#f5f5f5',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8
  },
  message: {
    color: '#9ea4b5',
    fontSize: 13,
    lineHeight: 20
  }
});

export default EmptyState;
