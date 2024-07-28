// src/components/ToggleLink.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const ToggleLink = ({ onPress, text }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: height * 0.02,
  },
  text: {
    color: '#888',
  },
});

export default ToggleLink;
