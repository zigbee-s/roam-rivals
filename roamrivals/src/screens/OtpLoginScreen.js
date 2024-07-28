import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, Dimensions, Keyboard, TouchableOpacity, Alert } from 'react-native';
import apiClient from '../api/apiClient';
import { saveToken } from '../api/tokenStorage';
import { UserContext } from '../context/UserContext';
import { ErrorContext } from '../context/ErrorContext';
import SubmitButton from '../components/SubmitButton';
import OtpInput from '../components/OtpInput';
import FormInput from '../components/FormInput';

const { width, height } = Dimensions.get('window');

const OtpLoginScreen = ({ route, navigation }) => {
  const { email, verifyOtpApi, resetPasswordApi, image, isResetPassword } = route.params; // Get parameters from navigation
  const [timer, setTimer] = useState(60);
  const { setUser } = useContext(UserContext);
  const { setError } = useContext(ErrorContext);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ newPassword: '', confirmPassword: '' });
  const [isOtpVerified, setIsOtpVerified] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const validatePasswords = () => {
    let valid = true;
    let errors = { newPassword: '', confirmPassword: '' };

    if (!newPassword.trim()) {
      errors.newPassword = 'New Password is required';
      valid = false;
    } else if (newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
      valid = false;
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (!otpString) {
      setOtpError('OTP is required');
      return;
    }
    setLoading(true);
    setOtpError('');
    setError('');
    Keyboard.dismiss(); // Dismiss the keyboard
    try {
      const response = await apiClient.post(verifyOtpApi, { email, otp: otpString });
      if (isResetPassword) {
        setTempToken(response.data.tempToken);
        setIsOtpVerified(true);
      } else {
        await saveToken(response.data.token, 'jwt');
        await saveToken(response.data.refreshToken, 'refreshToken');
        const rolesResponse = await apiClient.get('/user/profile', {
          headers: { Authorization: `Bearer ${response.data.token}` },
        });
        setUser(rolesResponse.data);
        await saveToken(JSON.stringify(rolesResponse.data), 'user');
        navigation.navigate('Events');
      }
    } catch (error) {
      setOtpError(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (validatePasswords()) {
      setLoading(true);
      setError('');
      try {
        await apiClient.post(resetPasswordApi, { tempToken, newPassword });
        setLoading(false);
        navigation.navigate('Login');
        Alert.alert('Success', 'Password reset successfully. Please login with your new password.');
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to reset password');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator style={styles.loading} size="large" color="#0000ff" />}
      <View style={styles.header}>
        <Image source={image} style={styles.image} />
      </View>
      <View style={styles.formBackground}>
        <View style={styles.form}>
          {!isOtpVerified && (
            <>
              <OtpInput
                otpLength={4}
                values={otp}
                onChange={setOtp}
                onError={setOtpError}
                editable={!isOtpVerified}
              />
              {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}
              <Text style={styles.instructionText}>
                Enter Verification Code we have sent onto <Text style={styles.emailText}>{email}</Text>
              </Text>
              <TouchableOpacity>
                <Text style={styles.resendText}>
                  Resend code - {timer > 0 ? `00:${timer < 10 ? `0${timer}` : timer}` : '00:00'}
                </Text>
              </TouchableOpacity>
              <SubmitButton
                onPress={handleVerifyOtp}
                isActive={otp.every(val => val !== '')}
                title="Verify OTP"
                style={[styles.nextButton, otp.every(val => val !== '') && styles.buttonActive]}
              />
            </>
          )}
          {isOtpVerified && (
            <>
              <FormInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                error={errors.newPassword}
              />
              <FormInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                error={errors.confirmPassword}
              />
              <SubmitButton
                onPress={handleResetPassword}
                isActive={newPassword && confirmPassword}
                title="Reset Password"
                style={[styles.nextButton, newPassword && confirmPassword && styles.buttonActive]}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00072D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: {
    position: 'absolute',
    zIndex: 1,
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
    marginTop: height * 0.05,
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
    marginBottom: width * 0.35,
    justifyContent: 'center',
  },
  instructionText: {
    fontSize: width * 0.04,
    color: '#666',
    marginVertical: height * 0.01,
    textAlign: 'center',
  },
  emailText: {
    color: '#000A23',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: height * 0.01,
    marginTop: -height * 0.01,
    textAlign: 'center',
  },
  nextButton: {
    width: '100%',
    height: height * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    marginTop: width * 0.2,
    marginBottom: width * -0.32,
    backgroundColor: '#696969',
  },
  buttonActive: {
    backgroundColor: '#000A23',
  },
  loginWithPasswordText: {
    color: '#888',
    textDecorationLine: 'underline',
  },
  resendText: {
    fontSize: width * 0.04,
    color: '#1a1a2e',
    textAlign: 'center',
    marginTop: width * 0.1,
    textDecorationLine: 'underline',
  },
  loginPassword: {
    alignItems: 'flex-start',
    marginTop: width * -0.02,
  },
});

export default OtpLoginScreen;
