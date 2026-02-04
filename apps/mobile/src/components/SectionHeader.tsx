import { StyleSheet, Text, View } from 'react-native';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
};

const SectionHeader = ({ title, subtitle }: SectionHeaderProps) => {
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.accent} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16
  },
  title: {
    color: '#f5f5f5',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase'
  },
  subtitle: {
    marginTop: 4,
    color: '#9ea4b5',
    fontSize: 13,
    letterSpacing: 0.4
  },
  accent: {
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#ff7a51'
  }
});

export default SectionHeader;
