import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import BackButton from '../components/BackButton';
import SubmitButton from '../components/SubmitButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import apiClient from '../api/apiClient';
import { ErrorContext } from '../context/ErrorContext';
import { UserContext } from '../context/UserContext';

const { width, height } = Dimensions.get('window');

const UploadImageScreen = ({ navigation, route }) => {
  const { eventId } = route.params;
  const [themes, setThemes] = useState([]);
  const [themeChosen, setThemeChosen] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [remainingUploads, setRemainingUploads] = useState(0);
  const [event, setEvent] = useState({});
  const [loading, setLoading] = useState(true);
  const { setError } = useContext(ErrorContext);
  const { user } = useContext(UserContext);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await apiClient.get(`/events/${eventId}`);
        console.log('Event details response:', response.data);
        setEvent(response.data);
        setThemes(response.data.themes || []);
        setRemainingUploads(response.data.maxPhotos - response.data.uploadedPhotosCount);
      } catch (error) {
        setError('Failed to fetch event details');
        Alert.alert('Failed to fetch event details', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
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
    if (!themeChosen || !selectedImage) {
      Alert.alert('Please choose a theme and select an image');
      return;
    }

    if (remainingUploads <= 0) {
      Alert.alert('You have reached the maximum number of uploads for this event');
      return;
    }

    setUploading(true);
    try {
      const presignedUrlResponse = await apiClient.post(
        `/photos/generate-upload-url/${eventId}`,
        { theme: themeChosen }
      );

      const { uploadUrl, key, eventId: eventID, uploadedBy } = presignedUrlResponse.data;

      const imageType = getImageType(selectedImage);
      const imageResponse = await fetch(selectedImage);
      const blob = await imageResponse.blob();

      await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': imageType,
        },
        body: blob,
      });

      await apiClient.post(
        `/photos/confirm-upload/${eventID}`,
        {
          key,
          eventId: eventID,
          uploadedBy,
          theme: themeChosen,
        }
      );

      Alert.alert('Photo uploaded successfully');
      navigation.navigate('EventScreen'); // Navigate to the EventScreen
    } catch (error) {
      Alert.alert('Failed to upload photo', error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  console.log('Themes:', themes);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {event.logoPresignedUrl ? (
          <Image source={{ uri: event.logoPresignedUrl }} style={styles.photoContainer} />
        ) : (
          <Image source={require('../../assets/quiz_landing.png')} style={styles.photoContainer} />
        )}
      </View>
      <View style={styles.formBackground}>
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View style={styles.lowerSection}>
            <Text style={styles.title}>Submit your Photograph</Text>
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
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Icon name="file" size={20} color="#FFFFFF" style={styles.fileIcon} />
                <View style={styles.lineicon} />
                <Text style={styles.buttonText}>Upload from Files</Text>
              </TouchableOpacity>
            </View>
            {selectedImage && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: selectedImage }} style={styles.image} />
              </View>
            )}
            <Text style={styles.uploadsText}>You can upload {remainingUploads} more photos.</Text>
            <View style={styles.navigationButtons}>
              <BackButton onPress={() => navigation.goBack()} style={styles.navButton} />
              <SubmitButton
                title={uploading ? "Uploading..." : "Upload"}
                onPress={handleSubmit}
                isActive={!uploading}
                style={styles.submitButton}
              />
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoContainer: {
    width: width,
    height: height * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  formBackground: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: width * 0.05,
    marginTop: -height * 0.06,
    paddingLeft: height * 0.03,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lowerSection: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: width * 0.08,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '60%',
    height: height * 0.07,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: width * 0.04,
    paddingHorizontal: width * 0.04,
    backgroundColor: '#a9a9a9',
  },
  fileIcon: {
    marginRight: 10, // Add margin to the file icon to create space between the icon and the line
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10, // Add margin to the text to create space between the line and text
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: width * 0.1,
    marginTop: width * 0.1,
  },
  imageContainer: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
    borderRadius: 20,
  },
  image: {
    width: width * 0.8,
    height: height * 0.4,
  },
  uploadsText: {
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  navButton: {
    width: '20%',
    height: height * 0.07,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: width * 0.02,
    borderColor: '#CCCCCC',
    borderWidth: 1,
  },
  submitButton: {
    width: '70%',
    backgroundColor: '#000A23',
    marginBottom: width * 0.04,
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.2,
    borderRadius: width * 0.02,
    alignItems: 'center',
  },
  themesTitle: {
    fontSize: width * 0.05,
    color: '#666',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  themeText: {
    fontSize: width * 0.04,
    color: '#666',
  },
  photoCount: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  lineicon: {
    width: 1,
    height: 25,
    marginHorizontal: 5,
    backgroundColor: '#FFFFFF',
  },
});

export default UploadImageScreen;
