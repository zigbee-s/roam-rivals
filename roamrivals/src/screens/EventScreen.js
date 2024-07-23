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
  const [remainingLikes, setRemainingLikes] = useState(0);
  const [maxLikes, setMaxLikes] = useState(0);
  const [eventStatuses, setEventStatuses] = useState({});

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get('/events');
      setEvents(response.data);
      
      const statuses = await Promise.all(response.data.map(event => fetchEventStatus(event._id)));
      const statusMap = {};
      response.data.forEach((event, index) => {
        statusMap[event._id] = statuses[index];
      });
      setEventStatuses(statusMap);

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

  const fetchEventStatus = async (eventId) => {
    try {
      const response = await apiClient.get(`/events/${eventId}/status`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch event status', error);
      return null;
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
        console.log(error.message);
      } else {
        console.log(error.message);
      }
    } finally {
      setPhotoLoading(false);
    }
  };

  const fetchLikesCount = async (eventId) => {
    try {
      const response = await apiClient.get(`/photos/${eventId}/userLikesCount`);
      setRemainingLikes(response.data.maxLikesPerUser - response.data.count);
      setMaxLikes(response.data.maxLikesPerUser);
    } catch (error) {
      console.error('Failed to load likes count', error);
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
      await fetchLikesCount(event._id);
    }
  };

  const handleLikePhoto = async (eventId, photoId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/photos/${eventId}/like`, { photoId });
      setPhotos((prevPhotos) => prevPhotos.map(photo => 
        photo._id === photoId ? { ...photo, likesCount: (photo.likesCount || 0) + 1 } : photo
      ));
      setRemainingLikes((prevRemainingLikes) => prevRemainingLikes - 1);
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
              {selectedEvent.logoPresignedUrl && (
                <Image source={{ uri: selectedEvent.logoPresignedUrl }} style={styles.logo} />
              )}
              <Text style={styles.title}>{selectedEvent.title}</Text>
              <Text>{selectedEvent.description}</Text>
              {selectedEvent.eventType === 'photography' && (
                <>
                  <Text style={styles.subTitle}>Uploaded Photos</Text>
                  {photoLoading ? (
                    <ActivityIndicator size="large" color="#0000ff" />
                  ) : (
                    <>
                      <Text>Remaining Likes: {remainingLikes}</Text>
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
                              onPress={() => handleLikePhoto(selectedEvent._id, item._id)}
                              disabled={remainingLikes <= 0}
                            />
                          </View>
                        )}
                      />
                    </>
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
                  {item.logoPresignedUrl && (
                    <Image source={{ uri: item.logoPresignedUrl }} style={styles.logo} />
                  )}
                  <Text style={styles.title}>{item.title}</Text>
                  <Text>{item.description}</Text>
                  <Text>Status: {eventStatuses[item._id] ? JSON.stringify(eventStatuses[item._id]) : 'Loading...'}</Text>
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
  logo: {
    width: '100%',
    height: 200,
    marginBottom: 10,
  },
});

export default EventScreen;
