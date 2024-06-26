import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import apiClient from '../apiClient';
import { saveToken } from '../tokenStorage';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation, setUserRoles }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    if (!password.trim()) {
      errors.password = 'Password is required';
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      setOtpSent(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('Login failed');
      }
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/verify-otp-login', { email, otp });
      await saveToken(response.data.token, 'jwt');
      await saveToken(response.data.refreshToken, 'refreshToken');
      const token = response.data.token;
      const rolesResponse = await apiClient.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserRoles(rolesResponse.data.roles);
      navigation.navigate('Events');
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage('OTP verification failed');
      }
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : otpSent ? (
        <View style={styles.innerContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            onChangeText={setOtp}
            value={otp}
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          <TouchableOpacity onPress={handleVerifyOtp} style={[styles.button, styles.buttonActive]}>
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.innerContainer}>
          <View style={styles.header}>
            <Image source={require('../assets/Login.png')} style={styles.image} />
          </View>
          <View style={styles.formBackground}>
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor="#888"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={togglePasswordVisibility}>
                  <Text>{isPasswordVisible ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              <TouchableOpacity
                style={[styles.button, email && password && styles.buttonActive]}
                onPress={handleLogin}
              >
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Want to Join us? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.registerLink}>Register</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
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
  innerContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
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
    flex: 1,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: width * 0.05,
    paddingVertical: height * 0.03,
    alignItems: 'center',
    marginTop: height * 0.03,
  },
  form: {
    width: '100%',
    justifyContent: 'center',
  },
  input: {
    width: '100%',
    height: height * 0.07,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.025,
    marginBottom: height * 0.015,
    backgroundColor: '#FFFFFF',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: width * 0.02,
    marginBottom: height * 0.015,
    backgroundColor: '#FFFFFF',
  },
  passwordInput: {
    flex: 1,
    height: height * 0.07,
    paddingHorizontal: width * 0.025,
  },
  eyeIcon: {
    paddingHorizontal: width * 0.025,
  },
  errorText: {
    color: 'red',
    marginBottom: height * 0.01,
    marginTop: -height * 0.01,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: height * 0.02,
  },
  forgotPasswordText: {
    color: '#888',
  },
  button: {
    width: '100%',
    height: height * 0.07,
    backgroundColor: '#696969',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    marginTop: height * 0.09,
  },
  buttonActive: {
    backgroundColor: '#000A23',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: height * 0.02,
  },
  registerText: {
    color: '#888',
  },
  registerLink: {
    color: '#000A23',
    fontWeight: 'bold',
  },
});

export default LoginScreen;
