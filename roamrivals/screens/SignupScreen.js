import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import apiClient from '../apiClient';
import { saveToken } from '../tokenStorage';

const SignupScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState([]);

  const handleSignup = async () => {
    try {
      const response = await apiClient.post('/auth/signup', { name, email, password });
      console.log('Signup Token:', response.data.token); // Debugging
      await saveToken(response.data.token, 'jwt');
      await saveToken(response.data.refreshToken, 'refreshToken');
      navigation.navigate('Profile');
    } catch (error) {
      if (error.response && error.response.data.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors([{ message: 'An unexpected error occurred' }]);
      }
    }
  };

  return (
    <View style={styles.container}>
      {errors.length > 0 && (
        <View style={styles.errorContainer}>
          {errors.map((err, index) => (
            <Text key={index} style={styles.errorText}>{err.message}</Text>
          ))}
        </View>
      )}
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignup} />
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
  errorContainer: {
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
  },
});

export default SignupScreen;
