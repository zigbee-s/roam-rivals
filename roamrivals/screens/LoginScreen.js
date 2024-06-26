// roamrivals/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TextInput, Button, Text, Alert } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import apiClient from '../apiClient'; 
import { saveToken } from '../tokenStorage'; 

const LoginScreen = ({ navigation, setUserRoles }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [tempToken, setTempToken] = useState(''); // State to store temporary token
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [useOtp, setUseOtp] = useState(false); // State to toggle OTP login
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false); // State to toggle Forgot Password mode

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await apiClient.post('/auth/login', { email, password, useOtp });
      if (useOtp) {
        setEmail(email);
        setOtpSent(true);
      } else {
        await saveToken(response.data.token, 'jwt');
        await saveToken(response.data.refreshToken, 'refreshToken');
        const rolesResponse = await apiClient.get('/user/profile', {
          headers: { Authorization: `Bearer ${response.data.token}` },
        });
        setUserRoles(rolesResponse.data.roles);
        navigation.navigate('Events');
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await apiClient.post('/auth/verify-otp-login', { email, otp });
      await saveToken(response.data.token, 'jwt');
      await saveToken(response.data.refreshToken, 'refreshToken');
      const rolesResponse = await apiClient.get('/user/profile', {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });
      setUserRoles(rolesResponse.data.roles);
      navigation.navigate('Events');
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('OTP verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (email) => {
    setLoading(true);
    setErrorMessage('');
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setOtpSent(true);
      setEmail(email);
      Alert.alert('Success', 'OTP sent to email. Please use it to reset your password.');
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async ({ newPassword, confirmPassword }) => {
    setLoading(true);
    setErrorMessage('');
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await apiClient.post('/auth/reset-password', { tempToken, newPassword });
      Alert.alert('Success', 'Password reset successfully. Please login with your new password.');
      setForgotPasswordMode(false);
      setOtpSent(false);
      setOtpVerified(false);
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyForgotPasswordOtp = async (otpValue) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await apiClient.post('/auth/verify-otp-forgot-password', { email, otp: otpValue });
      setOtpVerified(true);
      setTempToken(response.data.tempToken); // Store temporary token for later use
      Alert.alert('Success', 'OTP verified. You can now reset your password.');
    } catch (error) {
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('OTP verification failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : forgotPasswordMode ? (
        otpVerified ? (
          <Formik
            initialValues={{ newPassword: '', confirmPassword: '' }}
            validationSchema={yup.object().shape({
              newPassword: yup.string().min(6, 'Password must be at least 6 characters').required('New Password is required'),
              confirmPassword: yup.string().oneOf([yup.ref('newPassword'), null], 'Passwords must match').required('Confirm Password is required')
            })}
            onSubmit={(values) => handleResetPassword(values)}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter New Password"
                  onChangeText={handleChange('newPassword')}
                  onBlur={handleBlur('newPassword')}
                  value={values.newPassword}
                  secureTextEntry
                />
                {touched.newPassword && errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Confirm New Password"
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  value={values.confirmPassword}
                  secureTextEntry
                />
                {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                <Button onPress={handleSubmit} title="Reset Password" />
                <Button onPress={() => setForgotPasswordMode(false)} title="Back to Login" />
              </View>
            )}
          </Formik>
        ) : otpSent ? (
          <Formik
            initialValues={{ otp: '' }}
            validationSchema={yup.object().shape({
              otp: yup.string().required('OTP is required')
            })}
            onSubmit={({ otp }) => handleVerifyForgotPasswordOtp(otp)}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter OTP"
                  onChangeText={handleChange('otp')}
                  onBlur={handleBlur('otp')}
                  value={values.otp}
                  keyboardType="numeric"
                />
                {touched.otp && errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                <Button onPress={handleSubmit} title="Verify OTP" />
                <Button onPress={() => setForgotPasswordMode(false)} title="Back to Login" />
              </View>
            )}
          </Formik>
        ) : (
          <Formik
            initialValues={{ email: '' }}
            validationSchema={yup.object().shape({
              email: yup.string().email('Invalid email').required('Email is required')
            })}
            onSubmit={({ email }) => handleForgotPassword(email)}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  value={values.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                <Button onPress={handleSubmit} title="Send OTP" />
                <Button onPress={() => setForgotPasswordMode(false)} title="Back to Login" />
              </View>
            )}
          </Formik>
        )
      ) : otpSent ? (
        <View>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            onChangeText={setOtp}
            value={otp}
            keyboardType="numeric"
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <Button onPress={handleVerifyOtp} title="Verify OTP" />
        </View>
      ) : (
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={yup.object().shape({
            email: yup.string().email('Invalid email').required('Email is required'),
            password: useOtp ? yup.string().nullable() : yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
          })}
          onSubmit={handleLogin}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              {!useOtp && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Password"
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    secureTextEntry
                  />
                  {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </>
              )}
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              <Button onPress={handleSubmit} title="Log In" />
              <Button
                title={`Login with ${useOtp ? 'Password' : 'OTP'}`}
                onPress={() => setUseOtp(!useOtp)}
              />
              <Button
                title="Forgot Password"
                onPress={() => setForgotPasswordMode(true)}
              />
            </View>
          )}
        </Formik>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
});

export default LoginScreen;
