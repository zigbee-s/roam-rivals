// src/components/PasswordInput.js
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const PasswordInput = ({ placeholder, value, onChangeText, error }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!isPasswordVisible}
      />
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
      >
        <Icon name={isPasswordVisible ? 'eye-slash' : 'eye'} size={20} color="#888" />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
    marginBottom: height * 0.015,
  },
  input: {
    width: '100%',
    height: height * 0.07,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: width * 0.04,
    paddingHorizontal: width * 0.025,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    position: 'absolute',
    right: width * 0.03,
    top: height * 0.02,
  },
  errorText: {
    color: 'red',
    marginTop: height * 0.01,
  },
});

export default PasswordInput;
