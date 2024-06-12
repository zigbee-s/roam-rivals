// screens/EventScreen.js
import React, { useEffect, useState } from 'react';
import { View, Button, FlatList, Text, StyleSheet } from 'react-native';
import apiClient from '../apiClient';
import { useNavigation } from '@react-navigation/native';
import { getToken } from '../tokenStorage';

const EventScreen = () => {
  const [events, setEvents] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get('/events');
        setEvents(response.data);
      } catch (error) {
        console.error('Failed to fetch events', error);
      }
    };

    const checkAdmin = async () => {
      const token = await getToken();
      if (token) {
        const { roles } = JSON.parse(atob(token.split('.')[1]));
        if (roles.includes('admin')) {
          setIsAdmin(true);
        }
      }
    };

    fetchEvents();
    checkAdmin();
  }, []);

  const handleRegister = async (eventId) => {
    try {
      await apiClient.post('/events/register', { eventId });
      alert('Successfully registered for event');
    } catch (error) {
      console.error('Failed to register for event', error);
      alert('Registration failed');
    }
  };

  return (
    <View style={styles.container}>
      {isAdmin && (
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
            <Text>{new Date(item.date).toLocaleDateString()}</Text>
            <Text>{item.location}</Text>
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
    borderColor: '#ddd',
    borderRadius: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EventScreen;
