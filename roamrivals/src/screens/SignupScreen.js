// src/screens/SignupScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator, TextInput, Text } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import apiClient from '../api/apiClient';
import { saveToken } from '../api/tokenStorage';
import CustomButton from '../components/CustomButton';
import { UserContext } from '../context/UserContext';
import { ErrorContext } from '../context/ErrorContext';

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  username: yup.string().required('Username is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirm_password: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
  age: yup.number().required('Age is required').positive().integer(),
});

const SignupScreen = ({ navigation }) => {
  const { setUser } = useContext(UserContext);
  const { setError } = useContext(ErrorContext);
  const [otpSent, setOtpSent] = useState(false);
  const [signupData, setSignupData] = useState({ name: '', username: '', email: '', password: '', confirm_password: '', age: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignup = async (values, actions) => {
    setLoading(true);
    setErrorMessage('');
    setError(null); // Clear previous errors
    try {
      await apiClient.post('/auth/signup', values);
      setSignupData(values);
      setOtpSent(true);
    } catch (error) {
      if (!error.response) {
        setError('Unable to connect to the backend. Please try again later.');
      } else {
        setErrorMessage(error.response?.data?.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
      actions.setSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/verify-otp', { ...signupData, otp });
      await saveToken(response.data.token, 'jwt');
      await saveToken(response.data.refreshToken, 'refreshToken');
      const rolesResponse = await apiClient.get('/user/profile', {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });
      setUser(rolesResponse.data);
      await saveToken(JSON.stringify(rolesResponse.data), 'user');
      navigation.navigate('Events');
    } catch (error) {
      setLoading(false);
      setErrorMessage(error.response?.data?.message || 'OTP verification failed');
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
          <CustomButton onPress={handleVerifyOtp} title="Verify OTP" />
        </View>
      ) : (
        <Formik
          initialValues={{ name: '', username: '', email: '', password: '', confirm_password: '', age: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSignup}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
            <View>
              <TextInput
                style={styles.input}
                placeholder="Name"
                onChangeText={handleChange('name')}
                onBlur={handleBlur('name')}
                value={values.name}
              />
              {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Username"
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                value={values.username}
              />
              {touched.username && errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Email"
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
              />
              {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Password"
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                secureTextEntry
              />
              {touched.password && errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                onChangeText={handleChange('confirm_password')}
                onBlur={handleBlur('confirm_password')}
                value={values.confirm_password}
                secureTextEntry
              />
              {touched.confirm_password && errors.confirm_password && <Text style={styles.errorText}>{errors.confirm_password}</Text>}
              <TextInput
                style={styles.input}
                placeholder="Age"
                onChangeText={handleChange('age')}
                onBlur={handleBlur('age')}
                value={values.age}
                keyboardType="numeric"
              />
              {touched.age && errors.age && <Text style={styles.errorText}>{errors.age}</Text>}
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              <CustomButton onPress={handleSubmit} title="Sign Up" disabled={isSubmitting} />
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
  },
});

export default SignupScreen;
