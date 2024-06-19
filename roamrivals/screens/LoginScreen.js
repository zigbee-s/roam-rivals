import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TextInput, Button, Text } from 'react-native';
import AuthForm from '../components/AuthForm';
import apiClient from '../apiClient';
import { saveToken } from '../tokenStorage';

const LoginScreen = ({ navigation, setUserRoles }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      setEmail(email);
      setOtpSent(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Login failed');
      }
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/verify-otp-login', { email, otp });
      await saveToken(response.data.token, 'jwt');
      await saveToken(response.data.refreshToken, 'refreshToken');
      const token = response.data.token;
      const rolesResponse = await apiClient.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRoles(rolesResponse.data.roles);
      navigation.navigate('Events');
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('OTP verification failed');
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : otpSent ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            onChangeText={setOtp}
            value={otp}
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <Button onPress={handleVerifyOtp} title="Verify OTP" />
        </View>
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
  input: {
    borderBottomWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  errorText: {
    color: 'red',
  },
});

export default LoginScreen;
