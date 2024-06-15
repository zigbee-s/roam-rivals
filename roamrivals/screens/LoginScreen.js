// LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import AuthForm from '../components/AuthForm';
import apiClient from '../apiClient';
import { saveToken } from '../tokenStorage';

const LoginScreen = ({ navigation, setUserRoles }) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      await saveToken(response.data.token, 'jwt');
      await saveToken(response.data.refreshToken, 'refreshToken');

      const token = response.data.token;
      const rolesResponse = await apiClient.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRoles(rolesResponse.data.roles);

      navigation.navigate('Events');
    } catch (error) {
      setErrorMessage(error.response.data.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <AuthForm
          buttonText="Login"
          onSubmit={handleLogin}
          errorMessage={errorMessage}
          includeName={false}
        />
      )}
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
