import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import apiClient from '../apiClient';
import { deleteToken } from '../tokenStorage';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get('/user/profile');
        console.log('Profile Data:', response.data); // Debugging
        setUser(response.data);
      } catch (error) {
        setError(error.response.data.message || 'Failed to fetch profile');
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await deleteToken('jwt');
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {user ? (
        <View>
          <Text>Name: {user.name}</Text>
          <Text>Email: {user.email}</Text>
          <Button title="Logout" onPress={handleLogout} />
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default ProfileScreen;
