//src/screens/CreateEventScreen.js
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, TextInput, StyleSheet, Alert, ActivityIndicator, ScrollView, Text } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import apiClient from '../api/apiClient';
import CustomButton from '../components/CustomButton';

const validationSchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  date: yup.string().required('Date is required'),
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
      await apiClient.post('/events', {
        ...values,
        questions: quizQuestions,
      });
      Alert.alert('Success', 'Event created successfully');
      navigation.navigate('Events', { refresh: true });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleSetSampleQuestions = (setFieldValue) => {
    const sampleQuestions = [
      {
        question: "What is the chemical symbol for water?",
        options: ["H2O", "O2", "CO2", "H2"],
        correctAnswer: "H2O"
      },
      {
        question: "What planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Saturn"],
        correctAnswer: "Mars"
      },
      {
        question: "What gas do plants absorb from the atmosphere?",
        options: ["Oxygen", "Hydrogen", "Carbon Dioxide", "Nitrogen"],
        correctAnswer: "Carbon Dioxide"
      },
      {
        question: "What is the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"],
        correctAnswer: "Mitochondria"
      },
      {
        question: "How many elements are there in the periodic table?",
        options: ["108", "112", "118", "120"],
        correctAnswer: "118"
      }
    ];
    setFieldValue('questions', JSON.stringify(sampleQuestions, null, 2));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Formik
        initialValues={{
          title: '',
          description: '',
          date: '',
          location: '',
          eventType: 'general',
          numberOfQuestions: '',
          difficulty: '',
          timeLimit: '',
          questions: '',
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
              placeholder="Date"
              onChangeText={handleChange('date')}
              onBlur={handleBlur('date')}
              value={values.date}
            />
            {touched.date && errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
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
