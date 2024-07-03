// src/screens/OtpVerificationScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Text } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import CustomButton from '../components/CustomButton';
import apiClient from '../api/apiClient';  // Import your API client

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
      console.log("Sending request to verify OTP with email:", signupData.email, "and OTP:", values.otp); // Debug log
      // Call backend to verify OTP
      const response = await apiClient.post('/auth/verify-otp', {
        email: signupData.email,
        otp: values.otp,
      });

      console.log("Response received:", response.data); // Debug log
      
      // If OTP is verified successfully, navigate to CompleteSignup screen
      if (response.data.message === 'OTP verified successfully') {
        console.log("OTP verified successfully, navigating to CompleteSignup"); // Debug log
        navigation.navigate('CompleteSignup', { signupData });
      } else {
        console.log("OTP verification failed with message:", response.data.message); // Debug log
        setErrorMessage('Invalid OTP');
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log("OTP verification failed, invalid or expired OTP"); // Debug log
        setErrorMessage('Invalid or expired OTP');
      } else {
        console.log("Error occurred during OTP verification:", error); // Debug log
        setErrorMessage('An unexpected error occurred');
      }
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
    marginTop: 8,
  },
});

export default OtpVerificationScreen;
