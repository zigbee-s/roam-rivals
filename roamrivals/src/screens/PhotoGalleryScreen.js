import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Dimensions } from 'react-native';
import apiClient from '../api/apiClient';
import BackButton from '../components/BackButton';

const { width } = Dimensions.get('window');

const PhotoGalleryScreen = ({ navigation, route }) => {
  const { eventId } = route.params;
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await apiClient.get(`/photos/event/${eventId}`);
        setPhotos(response.data);
      } catch (error) {
        console.error('Failed to fetch photos', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [eventId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
        <Text style={styles.title}>Uploaded Photos</Text>
      </View>
      {loading ? (
        <Text>Loading photos...</Text>
      ) : (
        <FlatList
          data={photos}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <Image source={{ uri: item.imageUrl }} style={styles.photo} />
          )}
          numColumns={2}
          contentContainerStyle={styles.photoGrid}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: width * 0.12,
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  photoGrid: {
    justifyContent: 'space-between',
  },
  photo: {
    width: width / 2 - 20,
    height: width / 2 - 20,
    marginBottom: 10,
    borderRadius: 10,
  },
});

export default PhotoGalleryScreen;
