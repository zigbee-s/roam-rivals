// File: roamrivals/src/screens/CreateEventScreen.js

import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView, Text, Image, Button } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../api/apiClient';
import CustomButton from '../components/CustomButton';

const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  startingDate: yup.string().required('Starting date is required'),
  startingTime: yup.string().required('Starting time is required'),
  eventEndDate: yup.string().required('Event end date is required'),
  eventEndTime: yup.string().required('Event end time is required'),
  location: yup.string().required('Location is required'),
  eventType: yup.string().required('Event type is required'),
  numberOfQuestions: yup.number()
    .nullable()
    .when('eventType', {
      is: 'quiz',
      then: schema => schema.required('Number of questions is required for quiz').positive().integer(),
    }),
  difficulty: yup.string()
    .nullable()
    .when('eventType', {
      is: 'quiz',
      then: schema => schema.required('Difficulty is required for quiz'),
    }),
  timeLimit: yup.number()
    .nullable()
    .when('eventType', {
      is: 'quiz',
      then: schema => schema.required('Time limit is required for quiz').positive().integer(),
    }),
  questions: yup.string()
    .nullable()
    .when('eventType', {
      is: 'quiz',
      then: schema => schema.required('Questions are required for quiz'),
    }),
  maxPhotos: yup.number()
    .nullable()
    .when('eventType', {
      is: 'photography',
      then: schema => schema.required('Max photos is required for photography').positive().integer(),
    }),
  themes: yup.string()
    .nullable()
    .when('eventType', {
      is: 'photography',
      then: schema => schema.required('Themes are required for photography'),
    }),
  photoSubmissionDeadline: yup.string()
    .nullable()
    .when('eventType', {
      is: 'photography',
      then: schema => schema.required('Photo submission deadline is required for photography'),
    }),
  photoSubmissionTime: yup.string()
    .nullable()
    .when('eventType', {
      is: 'photography',
      then: schema => schema.required('Photo submission time is required for photography'),
    }),
  maxImagesPerUser: yup.number()
    .nullable()
    .when('eventType', {
      is: 'photography',
      then: schema => schema.required('Max images per user is required for photography').positive().integer(),
    }),
  maxLikesPerUser: yup.number()
    .nullable()
    .when('eventType', {
      is: 'photography',
      then: schema => schema.required('Max likes per user is required for photography').positive().integer(),
    }),
});

const CreateEventScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [logoImage, setLogoImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setLogoImage(result.assets[0].uri);
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

  const handleCreateEvent = async (values) => {
    setLoading(true);
    setErrorMessage('');
    try {
      let logoUrl = null;

      if (logoImage) {
        const presignedUrlResponse = await apiClient.post(
          `/events/generate-upload-url/logo`,
          { title: values.title }
        );

        const { uploadUrl, key } = presignedUrlResponse.data;

        const imageType = getImageType(logoImage);
        const imageResponse = await fetch(logoImage);
        const blob = await imageResponse.blob();

        await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': imageType,
          },
          body: blob,
        });

        logoUrl = key; // Use the key as the URL to be saved in the event
      }

      let quizQuestions = [];
      if (values.eventType === 'quiz') {
        try {
          quizQuestions = JSON.parse(values.questions);
          if (!Array.isArray(quizQuestions)) {
            throw new Error('Questions should be a JSON array.');
          }
        } catch (error) {
          setLoading(false);
          setErrorMessage('Invalid JSON format for questions.');
          return;
        }
      }

      const startingDateTime = new Date(`${values.startingDate}T${values.startingTime}:00`);
      const eventEndDateTime = new Date(`${values.eventEndDate}T${values.eventEndTime}:00`);
      const photoSubmissionDeadline = new Date(`${values.photoSubmissionDeadline}T${values.photoSubmissionTime}:00`);

      const themesArray = values.themes.split(',').map(theme => theme.trim());

      await apiClient.post('/events', {
        ...values,
        questions: quizQuestions,
        startingDate: startingDateTime.toISOString(),
        eventEndDate: eventEndDateTime.toISOString(),
        photoSubmissionDeadline: photoSubmissionDeadline.toISOString(),
        themes: themesArray,
        logoUrl,
      });
      Alert.alert('Success', 'Event created successfully');
      navigation.navigate('Events', { refresh: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Formik
        initialValues={{
          title: 'Nature Photography Contest',
          description: 'A contest to capture the best nature photographs.',
          startingDate: '2024-08-01',
          startingTime: '10:00',
          eventEndDate: '2024-08-15',
          eventEndTime: '18:00',
          location: 'Central Park',
          eventType: 'photography',
          numberOfQuestions: '',
          difficulty: '',
          timeLimit: '',
          questions: '',
          maxPhotos: '100',
          themes: 'Nature, Wildlife, Landscapes',
          photoSubmissionDeadline: '2024-08-14',
          photoSubmissionTime: '23:59',
          maxImagesPerUser: '5',  // Sample value
          maxLikesPerUser: '10',  // Sample value
        }}
        validationSchema={validationSchema}
        onSubmit={handleCreateEvent}
      >
        {({ handleChange, handleBlur, handleSubmit, values, setFieldValue, errors, touched }) => (
          <View>
            <TextInput
              style={styles.input}
              placeholder="Title"
              onChangeText={handleChange('title')}
              onBlur={handleBlur('title')}
              value={values.title}
            />
            {touched.title && errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Description"
              onChangeText={handleChange('description')}
              onBlur={handleBlur('description')}
              value={values.description}
            />
            {touched.description && errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Starting Date (YYYY-MM-DD)"
              onChangeText={handleChange('startingDate')}
              onBlur={handleBlur('startingDate')}
              value={values.startingDate}
            />
            {touched.startingDate && errors.startingDate && <Text style={styles.errorText}>{errors.startingDate}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Starting Time (HH:MM)"
              onChangeText={handleChange('startingTime')}
              onBlur={handleBlur('startingTime')}
              value={values.startingTime}
            />
            {touched.startingTime && errors.startingTime && <Text style={styles.errorText}>{errors.startingTime}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Event End Date (YYYY-MM-DD)"
              onChangeText={handleChange('eventEndDate')}
              onBlur={handleBlur('eventEndDate')}
              value={values.eventEndDate}
            />
            {touched.eventEndDate && errors.eventEndDate && <Text style={styles.errorText}>{errors.eventEndDate}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Event End Time (HH:MM)"
              onChangeText={handleChange('eventEndTime')}
              onBlur={handleBlur('eventEndTime')}
              value={values.eventEndTime}
            />
            {touched.eventEndTime && errors.eventEndTime && <Text style={styles.errorText}>{errors.eventEndTime}</Text>}
            <TextInput
              style={styles.input}
              placeholder="Location"
              onChangeText={handleChange('location')}
              onBlur={handleBlur('location')}
              value={values.location}
            />
            {touched.location && errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            <Picker
              selectedValue={values.eventType}
              style={styles.picker}
              onValueChange={(itemValue) => setFieldValue('eventType', itemValue)}
            >
              <Picker.Item label="General" value="general" />
              <Picker.Item label="Quiz" value="quiz" />
              <Picker.Item label="Photography" value="photography" />
            </Picker>
            {values.eventType === 'quiz' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Number of Questions"
                  onChangeText={handleChange('numberOfQuestions')}
                  onBlur={handleBlur('numberOfQuestions')}
                  value={values.numberOfQuestions}
                  keyboardType="numeric"
                />
                {touched.numberOfQuestions && errors.numberOfQuestions && <Text style={styles.errorText}>{errors.numberOfQuestions}</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Difficulty"
                  onChangeText={handleChange('difficulty')}
                  onBlur={handleBlur('difficulty')}
                  value={values.difficulty}
                />
                {touched.difficulty && errors.difficulty && <Text style={styles.errorText}>{errors.difficulty}</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Time Limit (minutes)"
                  onChangeText={handleChange('timeLimit')}
                  onBlur={handleBlur('timeLimit')}
                  value={values.timeLimit}
                  keyboardType="numeric"
                />
                {touched.timeLimit && errors.timeLimit && <Text style={styles.errorText}>{errors.timeLimit}</Text>}
                <TextInput
                  style={[styles.input, { height: 100 }]}
                  placeholder="Questions (JSON format)"
                  onChangeText={handleChange('questions')}
                  onBlur={handleBlur('questions')}
                  value={values.questions}
                  multiline
                />
                {touched.questions && errors.questions && <Text style={styles.errorText}>{errors.questions}</Text>}
                <CustomButton title="Set Sample Questions" onPress={() => handleSetSampleQuestions(setFieldValue)} />
              </>
            )}
            {values.eventType === 'photography' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Max Photos"
                  onChangeText={handleChange('maxPhotos')}
                  onBlur={handleBlur('maxPhotos')}
                  value={values.maxPhotos}
                  keyboardType="numeric"
                />
                {touched.maxPhotos && errors.maxPhotos && <Text style={styles.errorText}>{errors.maxPhotos}</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Themes (comma separated)"
                  onChangeText={handleChange('themes')}
                  onBlur={handleBlur('themes')}
                  value={values.themes}
                />
                {touched.themes && errors.themes && <Text style={styles.errorText}>{errors.themes}</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Photo Submission Deadline (YYYY-MM-DD)"
                  onChangeText={handleChange('photoSubmissionDeadline')}
                  onBlur={handleBlur('photoSubmissionDeadline')}
                  value={values.photoSubmissionDeadline}
                />
                {touched.photoSubmissionDeadline && errors.photoSubmissionDeadline && <Text style={styles.errorText}>{errors.photoSubmissionDeadline}</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Photo Submission Time (HH:MM)"
                  onChangeText={handleChange('photoSubmissionTime')}
                  onBlur={handleBlur('photoSubmissionTime')}
                  value={values.photoSubmissionTime}
                />
                {touched.photoSubmissionTime && errors.photoSubmissionTime && <Text style={styles.errorText}>{errors.photoSubmissionTime}</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Max Images Per User"
                  onChangeText={handleChange('maxImagesPerUser')}
                  onBlur={handleBlur('maxImagesPerUser')}
                  value={values.maxImagesPerUser}
                  keyboardType="numeric"
                />
                {touched.maxImagesPerUser && errors.maxImagesPerUser && <Text style={styles.errorText}>{errors.maxImagesPerUser}</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Max Likes Per User"
                  onChangeText={handleChange('maxLikesPerUser')}
                  onBlur={handleBlur('maxLikesPerUser')}
                  value={values.maxLikesPerUser}
                  keyboardType="numeric"
                />
                {touched.maxLikesPerUser && errors.maxLikesPerUser && <Text style={styles.errorText}>{errors.maxLikesPerUser}</Text>}
              </>
            )}
            <Button title="Pick a logo image" onPress={pickImage} />
            {logoImage && <Image source={{ uri: logoImage }} style={styles.image} />}
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <CustomButton title="Create Event" onPress={handleSubmit} disabled={loading} />
            )}
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 16,
  },
});

export default CreateEventScreen;
