import React, { useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Button } from 'react-native';
import axios from 'axios';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = () => {
    setLoading(true);
    axios.get('http://localhost:3000')
      .then(response => {
        console.log(response)
        setData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Fetch Data" onPress={fetchData} disabled={loading} />
      </View>
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {data && (
        <View style={styles.dataContainer}>
          <Text style={styles.text}>{JSON.stringify(data, null, 2)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  dataContainer: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
