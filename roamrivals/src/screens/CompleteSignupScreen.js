// src/screens/PasswordPage.js
import React, { useState, useContext } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import apiClient from '../api/apiClient';
import { UserContext } from '../context/UserContext';
import { ErrorContext } from '../context/ErrorContext';
import { saveToken } from '../api/tokenStorage';
import BackButton from '../components/BackButton';
import SubmitButton from '../components/SubmitButton';
import FormInput from '../components/FormInput';

const { width, height } = Dimensions.get('window');

const passwordValidationSchema = yup.object().shape({
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirm_password: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
});

const PasswordPage = ({ navigation, route }) => {
  const { setUser } = useContext(UserContext);
  const { setError } = useContext(ErrorContext);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { signupData, otp } = route.params;

  const handleCompleteSignup = async (values) => {
    setLoading(true);
    setErrorMessage('');
    setError(null); // Clear previous errors
    try {
      const response = await apiClient.post('/auth/complete-signup', { ...signupData, otp, ...values });
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

  const getBorderColor = (inputField, touched, errors) => {
    if (touched[inputField] && errors[inputField]) {
      return 'red';
    }
    if (touched.password && touched.confirm_password && !errors.password && !errors.confirm_password) {
      return 'green';
    }
    return '#CCCCCC';
  };

  const placeholderTextStyle = { fontSize: 18, fontWeight: 'semibold' }; // Adjust the font size as needed

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/Registration.png')} style={styles.image} />
      </View>
      <View style={styles.formBackground}>
        <View style={styles.form}>
          <Formik
            initialValues={{ password: '', confirm_password: '' }}
            validationSchema={passwordValidationSchema}
            onSubmit={handleCompleteSignup}
          >
            {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
              <View>
                <FormInput
                  placeholder="Create New Password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry={true}
                  error={touched.password && errors.password ? errors.password : ''}
                  isPassword={true}
                  placeholderTextStyle={placeholderTextStyle}
                />
                <FormInput
                  placeholder="Confirm Password"
                  value={values.confirm_password}
                  onChangeText={handleChange('confirm_password')}
                  onBlur={handleBlur('confirm_password')}
                  secureTextEntry={true}
                  error={touched.confirm_password && errors.confirm_password ? errors.confirm_password : ''}
                  isPassword={true}
                  placeholderTextStyle={placeholderTextStyle}
                />

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

                {loading ? (
                  <ActivityIndicator size="large" color="#0000ff" />
                ) : (
                  <View style={styles.buttonContainer}>
                    <BackButton
                      onPress={() => navigation.navigate('Signup')}
                      style={styles.backButtonCustom}
                    />
                    <SubmitButton
                      onPress={handleSubmit}
                      isActive={values.password && values.confirm_password && values.password === values.confirm_password}
                      style={styles.nextButton}
                      title="Join"
                    />
                  </View>
                )}
              </View>
            )}
          </Formik>
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
  errorText: {
    color: 'red',
    marginBottom: height * 0.01,
    marginTop: -height * 0.01,
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
    marginTop: height * 0.14,
  },
  nextButton: {
    width: '70%',
    height: height * 0.07,
    backgroundColor: '#696969',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    marginTop: height * 0.14,
  },
  nextButtonActive: {
    backgroundColor: '#000A23',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PasswordPage;
