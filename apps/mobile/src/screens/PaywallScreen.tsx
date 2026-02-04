import { StyleSheet, Text, View } from 'react-native';

const PaywallScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>PaywallScreen</Text>
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

export default PaywallScreen;
