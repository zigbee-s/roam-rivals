// ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { deleteToken, getToken } from '../tokenStorage';
import apiClient from '../apiClient';

const ProfileScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await getToken();
        const response = await apiClient.get('/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(response.data);
      } catch (error) {
        console.log('Failed to fetch user info', error);
      }
    };

    fetchUserInfo();
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
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>Name: {userInfo.name}</Text>
      <Text>Email: {userInfo.email}</Text>
      <Text>Registered Events:</Text>
      {userInfo.events.map((event) => (
        <Text key={event._id}>- {event.title}</Text>
      ))}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default ProfileScreen;
