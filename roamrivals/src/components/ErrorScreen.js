// src/components/ErrorScreen.js
import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, Button } from 'react-native';
import { ErrorContext } from '../context/ErrorContext';

const ErrorScreen = ({ onRetry }) => {
  const { error } = useContext(ErrorContext);

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/error.jpg')} style={styles.image} />
      <Text style={styles.message}>{error}</Text>
      <Button title="Retry" onPress={onRetry} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ErrorScreen;
