// roamrivals/src/components/ErrorScreen.js
import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const ErrorScreen = ({ route, navigation }) => {
  const { errorType } = route.params;

  let errorMessage = "An unexpected error occurred.";
  if (errorType === 'network') {
    errorMessage = "Network issue or unable to connect to the backend. Please check your connection and try again.";
  }

  return (
    <View style={styles.container}>
      <Text style={styles.errorText}>{errorMessage}</Text>
      <Button title="Go Back" onPress={() => navigation.goBack()} />
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
  errorText: {
    color: 'red',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default ErrorScreen;
