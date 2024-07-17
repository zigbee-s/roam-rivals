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
    if (!title || !description || !image) {
      Alert.alert('Please fill all fields and select an image');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Request a pre-signed URL from the backend
      const presignedUrlResponse = await apiClient.post(
        `/photos/generate-upload-url/${eventId}`,
        {
          title,
          description,
        }
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
        '/photos/confirm-upload',
        {
          key,
          title,
          description,
          eventId: eventID,
          uploadedBy,
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
