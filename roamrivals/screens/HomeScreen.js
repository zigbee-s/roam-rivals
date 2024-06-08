import React, { useEffect } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../tokenStorage';

const HomeScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getToken();
      if (token) {
        navigation.navigate('Profile');
      }
    };

    checkToken();
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Signup" onPress={() => navigation.navigate('Signup')} />
      <Button title="Login" onPress={() => navigation.navigate('Login')} />
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
