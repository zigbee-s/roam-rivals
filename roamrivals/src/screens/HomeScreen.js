import React from 'react';
import { View, StyleSheet } from 'react-native';
import CustomButton from '../components/CustomButton';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <CustomButton title="Sign Up" onPress={() => navigation.navigate('Signup')} />
      <CustomButton title="Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});

export default HomeScreen;
