// src/screens/CompleteSignupScreen.js
import React, { useState, useContext } from 'react';
import { View, StyleSheet, ActivityIndicator, TextInput, Text } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import apiClient from '../api/apiClient';
import CustomButton from '../components/CustomButton';
import { UserContext } from '../context/UserContext';
import { ErrorContext } from '../context/ErrorContext';
import { saveToken } from '../api/tokenStorage';

const passwordValidationSchema = yup.object().shape({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirm_password: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
});

const CompleteSignupScreen = ({ route, navigation }) => {
  const { setUser } = useContext(UserContext);
  const { setError } = useContext(ErrorContext);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { signupData } = route.params;

  const handleCompleteSignup = async (values) => {
    setLoading(true);
    setErrorMessage('');
    setError(null); // Clear previous errors
    try {
      const response = await apiClient.post('/auth/complete-signup', { ...signupData, ...values });
      await saveToken(response.data.token, 'jwt');
      await saveToken(response.data.refreshToken, 'refreshToken');
      const rolesResponse = await apiClient.get('/user/profile', {
        headers: { Authorization: `Bearer ${response.data.token}` },
      });
      setUser(rolesResponse.data);
      await saveToken(JSON.stringify(rolesResponse.data), 'user');
      navigation.navigate('Events');
    } catch (error) {
      if (!error.response) {
        setError('Unable to connect to the backend. Please try again later.');
      } else {
        setErrorMessage(error.response?.data?.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Formik
          initialValues={{ password: '', confirm_password: '' }}
          validationSchema={passwordValidationSchema}
          onSubmit={handleCompleteSignup}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View>
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
              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              <CustomButton onPress={handleSubmit} title="Complete Signup" />
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

export default CompleteSignupScreen;
