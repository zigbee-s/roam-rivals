// roamrivals/screens/AddQuestionsScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, FlatList, Text } from 'react-native';

const AddQuestionsScreen = ({ route, navigation }) => {
  const { setQuestions } = route.params;
  const [question, setQuestion] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');
  const [option3, setOption3] = useState('');
  const [option4, setOption4] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [questions, updateQuestions] = useState([]);

  const handleAddQuestion = () => {
    const newQuestion = {
      question,
      options: [option1, option2, option3, option4],
      correctAnswer
    };
    updateQuestions([...questions, newQuestion]);
    setQuestion('');
    setOption1('');
    setOption2('');
    setOption3('');
    setOption4('');
    setCorrectAnswer('');
  };

  const handleSaveQuestions = () => {
    setQuestions(questions);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Question"
        value={question}
        onChangeText={setQuestion}
      />
      <TextInput
        style={styles.input}
        placeholder="Option 1"
        value={option1}
        onChangeText={setOption1}
      />
      <TextInput
        style={styles.input}
        placeholder="Option 2"
        value={option2}
        onChangeText={setOption2}
      />
      <TextInput
        style={styles.input}
        placeholder="Option 3"
        value={option3}
        onChangeText={setOption3}
      />
      <TextInput
        style={styles.input}
        placeholder="Option 4"
        value={option4}
        onChangeText={setOption4}
      />
      <TextInput
        style={styles.input}
        placeholder="Correct Answer"
        value={correctAnswer}
        onChangeText={setCorrectAnswer}
      />
      <Button title="Add Question" onPress={handleAddQuestion} />
      <FlatList
        data={questions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.questionItem}>
            <Text>{item.question}</Text>
            <Text>{item.options.join(', ')}</Text>
            <Text>Correct Answer: {item.correctAnswer}</Text>
          </View>
        )}
      />
      <Button title="Save Questions" onPress={handleSaveQuestions} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
  },
  questionItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});

export default AddQuestionsScreen;
