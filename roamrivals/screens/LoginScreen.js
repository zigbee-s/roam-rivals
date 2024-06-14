// LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import AuthForm from '../components/AuthForm';
import apiClient from '../apiClient';
import { saveToken } from '../tokenStorage';

const LoginScreen = ({ navigation }) => {
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async ({ email, password }) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('Login Token:', response.data.token); // Debugging
      await saveToken(response.data.token, 'jwt');
      await saveToken(response.data.refreshToken, 'refreshToken');
      navigation.navigate('Events');
    } catch (error) {
      setErrorMessage(error.response.data.message || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <AuthForm
        buttonText="Login"
        onSubmit={handleLogin}
        errorMessage={errorMessage}
        includeName={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default LoginScreen;
