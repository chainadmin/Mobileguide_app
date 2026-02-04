import { StyleSheet, Text, View } from 'react-native';

const TrendingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>TrendingScreen</Text>
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

export default TrendingScreen;
