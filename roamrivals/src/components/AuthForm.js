import React from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';

const AuthForm = ({ headerText, errorMessage, onSubmit, submitButtonText }) => {
  const validationSchema = yup.object().shape({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
  });

  return (
    <View>
      <Text style={styles.header}>{headerText}</Text>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View>
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
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <Button onPress={handleSubmit} title={submitButtonText} />
          </View>
        )}
      </Formik>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
  errorText: {
    color: 'red',
  },
  header: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default AuthForm;
