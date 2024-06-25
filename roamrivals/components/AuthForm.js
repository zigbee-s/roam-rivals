// Example of AuthForm component
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const AuthForm = ({ headerText, errorMessage, onSubmit, submitButtonText }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View>
      <Text style={styles.header}>{headerText}</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TextInput
        secureTextEntry
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Button title={submitButtonText} onPress={() => onSubmit({ email, password })} />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 20,
    marginBottom: 10,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 5,
  },
  error: {
    color: 'red',
  },
});

export default AuthForm;
