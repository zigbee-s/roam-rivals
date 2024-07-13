// File: roamrivals/src/screens/UploadImageScreen.js

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../api/apiClient';

const UploadImageScreen = ({ navigation, route }) => {
  const { eventId } = route.params;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
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

  const uploadPhoto = async (formData) => {
    const response = await apiClient.post('/photos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  };

  const handleSubmit = async () => {
    if (!title || !description || !image) {
      Alert.alert('Please fill all fields and select an image');
      return;
    }

    setUploading(true);
    try {
      const imageType = getImageType(image);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('event', eventId);
      formData.append('photo', {
        uri: image,
        name: `photo.${image.split('.').pop()}`,
        type: imageType,
      });

      await uploadPhoto(formData);
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
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter title"
      />
      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
      />
      <Button title="Pick an image from gallery" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      <Button title={uploading ? "Uploading..." : "Upload Photo"} onPress={handleSubmit} disabled={uploading} />
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 16,
  },
});

export default UploadImageScreen;
