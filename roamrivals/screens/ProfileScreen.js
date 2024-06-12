// screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button } from 'react-native';
import apiClient from '../apiClient';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/user/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      }
    };

    fetchProfile();
  }, []);

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>Name: {profile.name}</Text>
      <Text>Email: {profile.email}</Text>
      <Text style={styles.subtitle}>Registered Events:</Text>
      <FlatList
        data={profile.events}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.eventItem}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{new Date(item.date).toLocaleDateString()}</Text>
            <Text>{item.location}</Text>
          </View>
        )}
      />
      <Button title="Home" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  eventItem: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
