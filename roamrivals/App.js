import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, ActivityIndicator, Button } from 'react-native';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [responseMessage, setResponseMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(uuidv4());
  const [authToken, setAuthToken] = useState('abcd'); // Replace with actual authentication token

  const submitForm = () => {
    setLoading(true);
    axios.post('http://localhost:3000/add-user', 
      { name, email, message },
      {
        headers: {
          'Idempotency-Key': idempotencyKey,
          'Authorization': `Bearer ${authToken}`
        }
      }
    )
    .then(response => {
      console.log(response);
      setResponseMessage(response.data);
      setLoading(false);
      // Clear idempotency key after successful request to ensure new one is generated next time
      setIdempotencyKey(uuidv4());
    })
    .catch(error => {
      console.error(error);
      setIdempotencyKey(uuidv4());
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
