import { StyleSheet, Text, View } from 'react-native';

const TitleDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TitleDetailScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: '600'
  }
});

export default TitleDetailScreen;
