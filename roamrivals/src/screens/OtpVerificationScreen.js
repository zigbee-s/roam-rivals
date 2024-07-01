// src/screens/OtpVerificationScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text, Alert } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import CustomButton from '../components/CustomButton';

const otpValidationSchema = yup.object().shape({
  otp: yup.string().required('OTP is required'),
});

const OtpVerificationScreen = ({ route, navigation }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signupData } = route.params;

  const handleOtpVerification = async (values, actions) => {
    setLoading(true);
    setErrorMessage('');
    try {
      // Verify OTP here, but we don't need to call the backend here, we do it in the next screen
      navigation.navigate('CompleteSignup', { signupData, otp: values.otp });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
      actions.setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Formik
        initialValues={{ otp: '' }}
        validationSchema={otpValidationSchema}
        onSubmit={handleOtpVerification}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Enter OTP"
              onChangeText={handleChange('otp')}
              onBlur={handleBlur('otp')}
              value={values.otp}
            />
            {touched.otp && errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <CustomButton onPress={handleSubmit} title="Verify OTP" disabled={isSubmitting || loading} />
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

export default OtpVerificationScreen;
