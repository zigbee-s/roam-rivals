// src/components/FormInput.js
import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

const FormInput = ({
  placeholder,
  value,
  onChangeText,
  onBlur,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  isPassword = false,
  placeholderTextStyle = {}
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(secureTextEntry);

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.input, placeholderTextStyle]}
        placeholder={placeholder}
        placeholderTextColor="#888"
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={isPasswordVisible}
        keyboardType={keyboardType}
      />
      {isPassword && (
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
        >
          <Icon name={isPasswordVisible ? 'eye-slash' : 'eye'} size={20} color="#888" />
        </TouchableOpacity>
      )}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: height * 0.015,
    position: 'relative',
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

export default FormInput;
