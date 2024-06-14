// ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { deleteToken, getToken } from '../tokenStorage';
import apiClient from '../apiClient';

const ProfileScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    let isMounted = true; // Add this to track the mounted state

    const fetchUserInfo = async () => {
      try {
        const token = await getToken();
        const response = await apiClient.get('/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          setUserInfo(response.data);
        }
      } catch (error) {
        console.log('Failed to fetch user info', error);
      }
    };

    fetchUserInfo();

    return () => {
      isMounted = false; // Set isMounted to false when the component is unmounted
      setUserInfo(null); // Reset userInfo state when the component is unmounted
    };
  }, []);

  const handleLogout = async () => {
    await deleteToken();
    await deleteToken('refreshToken');
    navigation.navigate('Home');
  };

  if (!userInfo) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.info}>{userInfo.name}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.info}>{userInfo.email}</Text>
        <Text style={styles.label}>Registered Events:</Text>
        {userInfo.events.map((event) => (
          <Text key={event._id} style={styles.event}>- {event.title}</Text>
        ))}
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  event: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default ProfileScreen;
