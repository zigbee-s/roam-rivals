  // src/components/OtpInput.js
  import React, { useRef } from 'react';
  import { View, TextInput, StyleSheet, Dimensions } from 'react-native';

  const { width, height } = Dimensions.get('window');

  const OtpInput = ({ otpLength = 4, values, onChange, onError }) => {
    const inputRefs = useRef([]);

    const handleInputChange = (text, index) => {
      if (/^\d$/.test(text) || text === '') {
        const otpArray = [...values];
        otpArray[index] = text;
        onChange(otpArray);

        if (text.length === 1 && index < inputRefs.current.length - 1) {
          inputRefs.current[index + 1]?.focus();
        }
      } else {
        onError('Only digits are allowed');
      }
    };

    const handleKeyPress = (e, index) => {
      if (e.nativeEvent.key === 'Backspace' && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    };

    return (
      <View style={styles.otpContainer}>
        {values.map((value, index) => (
          <View key={index.toString()} style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { borderColor: values.some(val => val === '') ? 'black' : 'green' }]}
              value={value}
              onChangeText={(text) => handleInputChange(text, index)}
              keyboardType="numeric"
              onKeyPress={(e) => handleKeyPress(e, index)}
              ref={(ref) => (inputRefs.current[index] = ref)}
              maxLength={1}
            />
          </View>
        ))}
      </View>
    );
  };

  const styles = StyleSheet.create({
    otpContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      width: '100%',
      marginBottom: height * 0.01,
    },
    inputContainer: {
      marginBottom: height * 0.015,
    },
    input: {
      width: width * 0.15,
      height: height * 0.07,
      borderWidth: 1,
      borderRadius: width * 0.02,
      paddingHorizontal: width * 0.025,
      backgroundColor: '#FFFFFF',
      textAlign: 'center',
      fontSize: width * 0.06,
    },
  });

  export default OtpInput;
