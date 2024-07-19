// File: roamrivals/src/screens/EventScreen.js

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Button, Alert, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../api/apiClient';
import { ErrorContext } from '../context/ErrorContext';
import { UserContext } from '../context/UserContext';

const EventScreen = ({ navigation }) => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setError } = useContext(ErrorContext);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [photoLoading, setPhotoLoading] = useState(false);

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

  const fetchPhotos = async (eventId) => {
    setPhotoLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/photos/event/${eventId}`);
      setPhotos(response.data);
    } catch (error) {
      if (!error.response) {
        setError('Unable to connect to the backend. Please try again later.');
      } else if (error.response.status === 403) {
        setError('Access forbidden: You do not have permission to access this resource.');
      } else {
        setError(error.response.data.message || 'An error occurred');
      }
    } finally {
      setPhotoLoading(false);
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

  const handleEventPress = async (event) => {
    setSelectedEvent(event);
    if (event.eventType === 'photography') {
      await fetchPhotos(event._id);
    }
  };

  const handleLikePhoto = async (photoId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/photos/like', { photoId });
      setPhotos((prevPhotos) => prevPhotos.map(photo => 
        photo._id === photoId ? { ...photo, likesCount: (photo.likesCount || 0) + 1 } : photo
      ));
      Alert.alert('Success', 'Photo liked successfully!');
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
          <Button
            title="View Leaderboard"
            onPress={() => navigation.navigate('LeaderboardScreen')}
          />
          {selectedEvent ? (
            <>
              <Button title="Back to Events" onPress={() => setSelectedEvent(null)} />
              <Text style={styles.title}>{selectedEvent.title}</Text>
              <Text>{selectedEvent.description}</Text>
              {selectedEvent.eventType === 'photography' && (
                <>
                  <Text style={styles.subTitle}>Uploaded Photos</Text>
                  {photoLoading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                  ) : (
                    <FlatList
                      data={photos}
                      keyExtractor={(item) => item._id}
                      renderItem={({ item }) => (
                        <View style={styles.photoContainer}>
                          <Image
                            source={{ uri: item.imageUrl }}
                            style={styles.photo}
                          />
                          <Text>Likes: {item.likesCount || 0}</Text>
                          <Button
                            title="Like"
                            onPress={() => handleLikePhoto(item._id)}
                          />
                        </View>
                      )}
                    />
                  )}
                  <Button 
                    title="Submit a Photo"
                    onPress={() => navigation.navigate('UploadImage', { eventId: selectedEvent._id })}
                  />
                </>
              )}
            </>
          ) : (
            <FlatList
              data={events}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.eventItem}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text>{item.description}</Text>
                  <Button title="Register" onPress={() => handleRegister(item._id)} />
                  <Button title="View Details" onPress={() => handleEventPress(item)} />
                </View>
              )}
            />
          )}
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
  subTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  photoContainer: {
    marginBottom: 20,
  },
  photo: {
    width: '100%',
    height: 200,
    marginVertical: 10,
  },
});

export default EventScreen;
