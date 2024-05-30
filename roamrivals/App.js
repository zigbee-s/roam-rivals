import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, Button } from 'react-native';
import axios from 'axios';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const submitForm = () => {
    setLoading(true);
    axios.post('http://localhost:3000/submit-form', { name, email, message })
      .then(response => {
        console.log(response);
        setResponseMessage(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
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
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Message"
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <View style={styles.buttonContainer}>
        <Button title="Submit" onPress={submitForm} disabled={loading} />
      </View>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {responseMessage && (
        <View style={styles.responseContainer}>
          <Text style={styles.text}>{responseMessage}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
  responseContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
