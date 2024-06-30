// src/screens/EventScreen.js
// src/screens/EventScreen.js
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/apiClient';
import { ErrorContext } from '../context/ErrorContext';
import { UserContext } from '../context/UserContext';

const EventScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setError } = useContext(ErrorContext);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/events');
      setEvents(response.data);
    } catch (error) {
      if (!error.response) {
        setError('Unable to connect to the backend. Please try again later.');
      } else if (error.response.status === 403) {
        setError('Access forbidden: You do not have permission to access this resource.');
      } else {
        setError(error.response.data.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, [])
  );

  const handleRegister = async (eventId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/events/register', { eventId });
      Alert.alert('Success', response.data.message);
      fetchEvents();
    } catch (error) {
      if (!error.response) {
        setError('Unable to connect to the backend. Please try again later.');
      } else if (error.response.status === 403) {
        setError('Access forbidden: You do not have permission to access this resource.');
      } else {
        setError(error.response.data.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {user && user.roles.includes('admin') && (
            <Button
              title="Create Event"
              onPress={() => navigation.navigate('CreateEvent')}
            />
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
        </>
      )}
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
});

export default EventScreen;
