import { StyleSheet, Text, View } from 'react-native';

const RegionSelectScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>RegionSelectScreen</Text>
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

export default RegionSelectScreen;
