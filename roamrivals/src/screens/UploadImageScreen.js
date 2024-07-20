// roamrivals/src/screens/UploadImageScreen.js

import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../api/apiClient';

const UploadImageScreen = ({ navigation, route }) => {
  const { eventId } = route.params;
  const [themes, setThemes] = useState([]);
  const [themeChosen, setThemeChosen] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [remainingUploads, setRemainingUploads] = useState(0);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await apiClient.get(`/photos/${eventId}/themes`);
        setThemes(response.data.themes);
      } catch (error) {
        Alert.alert('Failed to load themes', error.message);
      }
    };

    const fetchRemainingUploads = async () => {
      try {
        const response = await apiClient.get(`/photos/${eventId}/userUploadsCount`);
        setRemainingUploads(response.data.maxImagesPerUser - response.data.count);
      } catch (error) {
        console.error('Failed to fetch remaining uploads', error);
      }
    };

    fetchThemes();
    fetchRemainingUploads();
  }, [eventId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    } else {
      console.log('Image picking canceled or no assets found');
    }
  };

  const getImageType = (uri) => {
    const extension = uri.split('.').pop().toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'bmp':
        return 'image/bmp';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  };

  const handleSubmit = async () => {
    if (!themeChosen || !image) {
      Alert.alert('Please choose a theme and select an image');
      return;
    }

    if (remainingUploads <= 0) {
      Alert.alert('You have reached the maximum number of uploads for this event');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Request a pre-signed URL from the backend
      const presignedUrlResponse = await apiClient.post(
        `/photos/generate-upload-url/${eventId}`,
        { themeChosen }
      );

      const { uploadUrl, key, eventId: eventID, uploadedBy } = presignedUrlResponse.data;

      // Step 2: Upload the image to S3 using the pre-signed URL
      const imageType = getImageType(image);
      const imageResponse = await fetch(image);
      const blob = await imageResponse.blob();

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': imageType,
        },
        body: blob,
      });

      // Step 3: Confirm the upload and save metadata in the backend
      await apiClient.post(
        `/photos/confirm-upload/${eventID}`,
        {
          key,
          eventId: eventID,
          uploadedBy,
          themeChosen,
        }
      );

      Alert.alert('Photo uploaded successfully');
      navigation.navigate('Events'); // Navigate to the Events screen
    } catch (error) {
      Alert.alert('Failed to upload photo', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Choose a Theme</Text>
      <Picker
        selectedValue={themeChosen}
        onValueChange={(itemValue) => setThemeChosen(itemValue)}
        style={styles.picker}
        enabled={themes.length > 0} // Disable picker if there are no themes
      >
        <Picker.Item label="Select a theme" value="" />
        {themes.map((theme, index) => (
          <Picker.Item key={index} label={theme} value={theme} />
        ))}
      </Picker>
      <Button title="Pick an image from gallery" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title={uploading ? "Uploading..." : "Upload Photo"} onPress={handleSubmit} disabled={uploading || themes.length === 0} />
      <Text>You can upload {remainingUploads} more photos.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 18,
    marginVertical: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 16,
  },
});

export default UploadImageScreen;
