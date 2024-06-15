import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../apiClient';

const CreateEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);  // New loading state

  const handleCreateEvent = async () => {
    setLoading(true);  // Show loading indicator
    try {
      const response = await apiClient.post('/events', { title, description, date, location });
      Alert.alert('Success', 'Event created successfully');
      navigation.navigate('Events', { refresh: true });  // Pass a refresh flag to refresh the events list
      setLoading(false);  // Hide loading indicator
    } catch (error) {
      setErrorMessage(error.response.data.message || 'Failed to create event');
      setLoading(false);  // Hide loading indicator
    }
  };

  return (
    <View style={styles.container}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Date"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />  // Loading indicator
      ) : (
        <Button title="Create Event" onPress={handleCreateEvent} disabled={loading} />  // Disable button when loading
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default CreateEventScreen;
