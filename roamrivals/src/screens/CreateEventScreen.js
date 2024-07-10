import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView, Text, Button } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
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
  PhotosubmissionDeadline: yup.string()
    .nullable()
    .when('eventType', {
      is: 'photography',
      then: schema => schema.required('Photo submission deadline is required for photography'),
    }),
  PhotosubmissionTime: yup.string()
    .nullable()
    .when('eventType', {
      is: 'photography',
      then: schema => schema.required('Photo submission time is required for photography'),
    }),
});

const CreateEventScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateEvent = async (values) => {
    setLoading(true);
    setErrorMessage('');
    try {
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
      const photoSubmissionDeadline = new Date(`${values.PhotosubmissionDeadline}T${values.PhotosubmissionTime}:00`);

      await apiClient.post('/events', {
        ...values,
        questions: quizQuestions,
        startingDate: startingDateTime.toISOString(),
        eventEndDate: eventEndDateTime.toISOString(),
        PhotosubmissionDeadline: photoSubmissionDeadline.toISOString(),
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
          title: '',
          description: '',
          startingDate: '',
          startingTime: '',
          eventEndDate: '',
          eventEndTime: '',
          location: '',
          eventType: 'general',
          numberOfQuestions: '',
          difficulty: '',
          timeLimit: '',
          questions: '',
          maxPhotos: '',
          themes: '',
          PhotosubmissionDeadline: '',
          PhotosubmissionTime: '',
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
                  onChangeText={handleChange('PhotosubmissionDeadline')}
                  onBlur={handleBlur('PhotosubmissionDeadline')}
                  value={values.PhotosubmissionDeadline}
                />
                {touched.PhotosubmissionDeadline && errors.PhotosubmissionDeadline && <Text style={styles.errorText}>{errors.PhotosubmissionDeadline}</Text>}
                <TextInput
                  style={styles.input}
                  placeholder="Photo Submission Time (HH:MM)"
                  onChangeText={handleChange('PhotosubmissionTime')}
                  onBlur={handleBlur('PhotosubmissionTime')}
                  value={values.PhotosubmissionTime}
                />
                {touched.PhotosubmissionTime && errors.PhotosubmissionTime && <Text style={styles.errorText}>{errors.PhotosubmissionTime}</Text>}
              </>
            )}
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
});

export default CreateEventScreen;
