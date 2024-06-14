// EventScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../apiClient';
import { getToken } from '../tokenStorage';

const EventScreen = ({ navigation, userRoles }) => {
  const [events, setEvents] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get('/events');
      setEvents(response.data);
    } catch (error) {
      setErrorMessage(error.response.data.message || 'Failed to fetch events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchEvents();
    }, [])
  );

  const handleRegister = async (eventId) => {
    try {
      const response = await apiClient.post('/events/register', { eventId });
      Alert.alert('Success', response.data.message);
      fetchEvents(); // Refresh events list
    } catch (error) {
      setErrorMessage(error.response.data.message || 'Failed to register for event');
    }
  };

  return (
    <View style={styles.container}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {userRoles.includes('admin') && (
        <Button title="Create Event" onPress={() => navigation.navigate('CreateEvent')} />
      )}
      <FlatList
        data={events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text style={styles.title}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Button title="Register" onPress={() => handleRegister(item._id)} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  eventItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default EventScreen;
