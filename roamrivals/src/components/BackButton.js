// src/components/BackButton.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const BackButton = ({ onPress, style }) => (
  <TouchableOpacity style={style} onPress={onPress}>
    <Text style={styles.buttonText}>←</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    width: '20%',
    height: height * 0.07,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginTop: height * 0.09,
  },
  buttonText: {
    color: '#000',
    paddingBottom: width * 0.02,
    fontSize: width * 0.06,
    fontWeight: 'bold',
  },
});

export default BackButton;
