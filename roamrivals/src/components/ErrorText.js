// src/components/ErrorText.js
import React from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const ErrorText = ({ message }) => {
  if (!message) return null;
  return <Text style={styles.errorText}>{message}</Text>;
};

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    marginBottom: height * 0.01,
    marginTop: -height * 0.01,
  },
});

export default ErrorText;
