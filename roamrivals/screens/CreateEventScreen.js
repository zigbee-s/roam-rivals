// roamrivals/screens/CreateEventScreen.js
import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import { View, TextInput, Button, StyleSheet, Alert, ActivityIndicator, ScrollView, Text } from 'react-native';
import apiClient from '../apiClient';

const CreateEventScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [eventType, setEventType] = useState('general');
  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [questions, setQuestions] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateEvent = async () => {
    setLoading(true);
    try {
      let quizQuestions = [];
      if (eventType === 'quiz') {
        try {
          quizQuestions = JSON.parse(questions);
          if (!Array.isArray(quizQuestions)) {
            throw new Error('Questions should be a JSON array.');
          }
        } catch (error) {
          setLoading(false);
          setErrorMessage('Invalid JSON format for questions.');
          return;
        }
      }
      const response = await apiClient.post('/events', { title, description, date, location, eventType, numberOfQuestions, difficulty, timeLimit, questions: quizQuestions });
      Alert.alert('Success', 'Event created successfully');
      navigation.navigate('Events', { refresh: true });
      setLoading(false);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to create event');
      setLoading(false);
    }
  };

  const handleSetSampleQuestions = () => {
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
    setQuestions(JSON.stringify(sampleQuestions, null, 2));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Date"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
      <Picker
        selectedValue={eventType}
        style={styles.picker}
        onValueChange={(itemValue) => setEventType(itemValue)}
      >
        <Picker.Item label="General" value="general" />
        <Picker.Item label="Quiz" value="quiz" />
      </Picker>
      {eventType === 'quiz' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Number of Questions"
            value={numberOfQuestions}
            onChangeText={setNumberOfQuestions}
          />
          <TextInput
            style={styles.input}
            placeholder="Difficulty"
            value={difficulty}
            onChangeText={setDifficulty}
          />
          <TextInput
            style={styles.input}
            placeholder="Time Limit (minutes)"
            value={timeLimit}
            onChangeText={setTimeLimit}
          />
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Questions (JSON format)"
            value={questions}
            onChangeText={setQuestions}
            multiline
          />
          <Button title="Set Sample Questions" onPress={handleSetSampleQuestions} />
        </>
      )}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Create Event" onPress={handleCreateEvent} disabled={loading} />
      )}
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
});

export default CreateEventScreen;
