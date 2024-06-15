// SignupScreen.js
import React from 'react';
import { View, StyleSheet, Button, TextInput, Text } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import apiClient from '../apiClient';
import { saveToken } from '../tokenStorage';

const validationSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const SignupScreen = ({ navigation }) => {
  const handleSignup = async (values, actions) => {
    try {
      const response = await apiClient.post('/auth/signup', values);
      await saveToken(response.data.token, 'jwt');
      await saveToken(response.data.refreshToken, 'refreshToken');
      navigation.navigate('Profile');
    } catch (error) {
      if (error.response && error.response.data.errors) {
        actions.setErrors({ api: error.response.data.errors });
      } else {
        actions.setErrors({ api: 'An unexpected error occurred' });
      }
    } finally {
      actions.setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ name: '', email: '', password: '' }}
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
            {errors.api && <Text style={styles.errorText}>{errors.api}</Text>}
            <Button onPress={handleSubmit} title="Sign Up" disabled={isSubmitting} />
          </View>
        )}
      </Formik>
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
