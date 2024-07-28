import React, { useState, useContext, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, Dimensions, TouchableOpacity, Keyboard } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import apiClient from '../api/apiClient';
import { saveToken } from '../api/tokenStorage';
import { UserContext } from '../context/UserContext';
import { ErrorContext } from '../context/ErrorContext';
import FormInput from '../components/FormInput';
import SubmitButton from '../components/SubmitButton';
import BackButton from '../components/BackButton'; // Import the BackButton component

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { setUser } = useContext(UserContext);
  const { setError } = useContext(ErrorContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const isFocused = useIsFocused();

  useEffect(() => {
    if (isFocused) {
      resetLoginState();
    }
  }, [isFocused]);

  const resetLoginState = () => {
    setIsOtpLogin(false);
    setIsForgotPassword(false);
    setEmail('');
    setPassword('');
    setErrors({ email: '', password: '' });
    setErrorMessage('');
  };

  const validate = () => {
    let valid = true;
    let errors = { email: '', password: '' };

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!emailPattern.test(email)) {
      errors.email = 'Invalid email address';
      valid = false;
    }

    // Password validation
    if (!isOtpLogin && !isForgotPassword && !password.trim()) {
      errors.password = 'Password is required';
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      setErrorMessage('');
      setError(null); // Clear any previous error

      Keyboard.dismiss(); // Close the keyboard

      try {
        if (isOtpLogin) {
          await apiClient.post('/auth/login', { email, useOtp: true });
          navigation.navigate('OtpLoginScreen', {
            email,
            verifyOtpApi: '/auth/verify-otp-login',
            image: require('../../assets/Login.png'),
          });
        } else if (isForgotPassword) {
          await apiClient.post('/auth/forgot-password', { email });
          navigation.navigate('OtpLoginScreen', {
            email,
            verifyOtpApi: '/auth/verify-otp-forgot-password',
            resetPasswordApi: '/auth/reset-password',
            image: require('../../assets/Login.png'),
            isResetPassword: true,
          });
        } else {
          const response = await apiClient.post('/auth/login', { email, password });
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
        if (!error.response) {
          setError('Unable to connect to the backend. Please try again later.');
        } else {
          setErrorMessage(error.response?.data?.message || 'Login failed');
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLoginMethodToggle = () => {
    setIsOtpLogin(!isOtpLogin);
    setIsForgotPassword(false);
    setErrorMessage('');
  };

  const handleForgotPassword = () => {
    setIsForgotPassword(true);
    setIsOtpLogin(false);
    setErrorMessage('');
  };

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      <View style={styles.header}>
        <Image source={require('../../assets/Login.png')} style={styles.image} />
      </View>
      <View style={styles.formBackground}>
        <View style={styles.form}>
          <Text style={styles.headerText}>
            {isForgotPassword ? 'Forgot Password' : 'Login'}
          </Text>
          <FormInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            error={errors.email}
          />
          {!isOtpLogin && !isForgotPassword && (
            <FormInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              isPassword={true}
              error={errors.password}
            />
          )}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {!isForgotPassword && (
            <View style={styles.passwordOtpHeader}>
              <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.forgotPassword} onPress={handleLoginMethodToggle}>
                <Text style={styles.forgotPasswordText}>
                  {isOtpLogin ? 'Login with Password' : 'Login with OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {isForgotPassword ? (
            <View style={styles.forgotPasswordButtons}>
              <BackButton onPress={resetLoginState} style={styles.backButton} />
              <SubmitButton
                onPress={handleSubmit}
                isActive={!!email}
                title="Send OTP"
                style={[styles.sendOtpButton, email && styles.buttonActive]}
              />
            </View>
          ) : (
            <SubmitButton
              onPress={handleSubmit}
              isActive={!!email}
              title={isOtpLogin ? "Send OTP" : "Login"}
              style={[styles.nextButton, email && styles.buttonActive]}
            />
          )}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Want to Join us? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: 'center',
  },
  backButton: {
    width: '20%',
    height: height * 0.07,
    marginBottom: width * -0.04,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    borderColor: '#CCCCCC',
    borderWidth: 1,
  },
  sendOtpButton: {
    width: '70%',
    height: height * 0.07,
    backgroundColor: '#696969',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    marginLeft: '5%',
  },
  headerText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    marginBottom: height * 0.02,
  },
  errorText: {
    color: 'red',
    marginBottom: height * 0.01,
    marginTop: -height * 0.01,
  },
  passwordOtpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: height * 0.02,
  },
  forgotPasswordText: {
    color: '#888',
    textDecorationLine: 'underline',
  },
  forgotPasswordButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width * 0.24,
    marginBottom: width * -0.32,
  },
  registerContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: height * 0.18,
  },
  registerText: {
    fontSize: width * 0.04,
    color: '#888',
  },
  registerLink: {
    fontSize: width * 0.04,
    color: '#635BDD',
    fontWeight: 'bold',
  },
  nextButton: {
    width: '100%',
    height: height * 0.07,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    marginBottom: width * -0.32,
    marginTop: width * 0.2,
    backgroundColor: '#696969',
  },
  buttonActive: {
    backgroundColor: '#000A23',
  },
});

export default LoginScreen;
