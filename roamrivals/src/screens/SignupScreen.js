// src/screens/RegistrationForm.js
import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import apiClient from '../api/apiClient'; // Ensure apiClient is imported
import FormInput from '../components/FormInput';
import SubmitButton from '../components/SubmitButton';

const { width, height } = Dimensions.get('window');

const RegistrationForm = ({ navigation }) => {
  const [formData, setFormData] = useState({ name: '', username: '', email: '', age: '' });
  const [errors, setErrors] = useState({ name: '', username: '', email: '', age: '' });
  const [loading, setLoading] = useState(false);

  const validate = () => {
    let valid = true;
    let errors = { name: '', username: '', email: '', age: '' };

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      valid = false;
    }

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
      valid = false;
    }

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      valid = false;
    } else if (!emailPattern.test(formData.email)) {
      errors.email = 'Invalid email address';
      valid = false;
    }

    // Age validation
    const agePattern = /^[0-9]+$/;
    if (!formData.age.trim()) {
      errors.age = 'Age is required';
      valid = false;
    } else if (!agePattern.test(formData.age) || parseInt(formData.age) <= 0) {
      errors.age = 'Invalid age';
      valid = false;
    }

    setErrors(errors);
    return valid;
  };

  const handleSubmit = async () => {
    if (validate()) {
      setLoading(true);
      try {
        await apiClient.post('/auth/initial-signup', formData);
        navigation.navigate('OtpVerification', { signupData: formData });
        // Alert.alert('Form Submitted', `Name: ${formData.name}, Username: ${formData.username}, Email: ${formData.email}, Age: ${formData.age}`);
      } catch (error) {
        Alert.alert('Signup Failed', error.response?.data?.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
  };

  const allFieldsFilled = formData.name && formData.username && formData.email && formData.age && !errors.name && !errors.username && !errors.email && !errors.age;

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const placeholderTextStyle = { fontSize: 18, fontWeight: 'semibold' }; // Adjust the font size as needed

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <View style={styles.header}>
            <Image source={require('../../assets/Registration.png')} style={styles.image} />
          </View>
          <View style={styles.formBackground}>
            <View style={styles.form}>
              <FormInput
                placeholder="Name"
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                error={errors.name}
                placeholderTextStyle={placeholderTextStyle}
              />
              <FormInput
                placeholder="Username"
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                error={errors.username}
                placeholderTextStyle={placeholderTextStyle}
              />
              <FormInput
                placeholder="Email"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                error={errors.email}
                placeholderTextStyle={placeholderTextStyle}
              />
              <FormInput
                placeholder="Age"
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
                keyboardType="numeric"
                error={errors.age}
                placeholderTextStyle={placeholderTextStyle}
              />
              <SubmitButton
                onPress={handleSubmit}
                isActive={allFieldsFilled}
                loading={loading}
                title="Next"
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#00072D',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: width * 0.2,
    marginBottom: height * 0.02,
  },
  image: {
    width: width * 0.8,
    height: height * 0.3,
    resizeMode: 'contain',
    marginBottom: width * 0.1,
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
    width: '90%',
    justifyContent: 'center',
  },
});

export default RegistrationForm;
