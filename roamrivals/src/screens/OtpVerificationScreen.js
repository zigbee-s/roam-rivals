// src/screens/VerificationScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import SubmitButton from '../components/SubmitButton';
import OtpInput from '../components/OtpInput';
import BackButton from '../components/BackButton';
import apiClient from '../api/apiClient'; // Import your API client

const otpValidationSchema = yup.object().shape({
  otp: yup.array().of(
    yup.string().matches(/^\d$/, 'Only digits are allowed').required('OTP is required')
  ).length(4, 'OTP must be 4 digits'),
});

const VerificationScreen = ({ route, navigation }) => {
  const [timer, setTimer] = useState(60);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpError, setOtpError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signupData } = route.params;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpVerification = async (values, actions) => {
    setLoading(true);
    setErrorMessage('');
    setOtpError('');
    try {
      const otpString = values.otp.join(''); // Combine the array into a single string
      console.log("Sending request to verify OTP with email:", signupData.email, "and OTP:", otpString); // Debug log
      // Call backend to verify OTP
      const response = await apiClient.post('/auth/verify-otp', {
        email: signupData.email,
        otp: otpString,
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

  const isSubmitButtonActive = (otp) => {
    return otp.every(val => /^\d$/.test(val)) && !otpError && !loading;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/Registration.png')} style={styles.image} />
      </View>
      <View style={styles.formBackground}>
        <View style={styles.form}>
          <Formik
            initialValues={{ otp: ['', '', '', ''] }}
            validationSchema={otpValidationSchema}
            onSubmit={handleOtpVerification}
          >
            {({ handleSubmit, values, setFieldValue }) => (
              <>
                <OtpInput
                  otpLength={4}
                  values={values.otp}
                  onChange={(otpArray) => setFieldValue('otp', otpArray)}
                  onError={(message) => setOtpError(message)}
                />
                {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                <Text style={styles.instructionText}>
                  Enter Verification Code we have sent onto <Text style={styles.emailText}>{signupData.email}</Text>
                </Text>
                <TouchableOpacity>
                  <Text style={styles.resendText}>
                    Resend code - {timer > 0 ? `00:${timer < 10 ? `0${timer}` : timer}` : '00:00'}
                  </Text>
                </TouchableOpacity>
                <View style={styles.buttonContainer}>
                  <BackButton
                    onPress={() => navigation.navigate('Signup')}
                    style={styles.backButtonCustom}
                  />
                  <SubmitButton
                    onPress={handleSubmit}
                    isActive={isSubmitButtonActive(values.otp)}
                    style={styles.submitButtonCustom}
                    title={'Next'}
                  />
                </View>
              </>
            )}
          </Formik>
        </View>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00072D',
    alignItems: 'center',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.8,
    height: height * 0.3,
    resizeMode: 'contain',
    marginTop: width * 0.2,
  },
  formBackground: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
    alignItems: 'center',
    marginTop: height * 0.05,
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    justifyContent: 'center',
    marginBottom: width * 0.2,
  },
  instructionText: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'center',
    marginBottom: height * 0.015,
  },
  emailText: {
    color: '#000A23',
    fontWeight: 'bold',
  },
  resendText: {
    fontSize: width * 0.04,
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: height * 0.04,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButtonCustom: {
    width: '20%',
    height: height * 0.07,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginTop: height * 0.09,
  },
  submitButtonCustom: {
    width: '70%',
    height: height * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    marginTop: height * 0.09,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: height * 0.02,
  },
});

export default VerificationScreen;
