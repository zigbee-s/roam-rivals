// src/screens/ProfileScreen.js

import React, { useContext, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import { deleteToken } from '../api/tokenStorage';

const ProfileScreen = ({ navigation }) => {
  const { user, setUser, loading, updateUserProfile } = useContext(UserContext);

  useFocusEffect(
    useCallback(() => {
      const fetchUserInfo = async () => {
        await updateUserProfile();
      };

      fetchUserInfo();
    }, [updateUserProfile])
  );

  const handleLogout = async () => {
    await deleteToken();
    await deleteToken('refreshToken');
    await deleteToken('user');
    setUser(null);
    navigation.navigate('Home');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!user) {
    return <Text>Failed to load user info. Please try again later.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.info}>{user.name}</Text>
        <Text style={styles.label}>Username:</Text>
        <Text style={styles.info}>{user.username}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.info}>{user.email}</Text>
        <Text style={styles.label}>Age:</Text>
        <Text style={styles.info}>{user.age}</Text>
        <Text style={styles.label}>XP:</Text>
        <Text style={styles.info}>{user.xp}</Text>
        <Text style={styles.label}>Roles:</Text>
        {user.roles.map((role, index) => (
          <Text key={index} style={styles.info}>{role}</Text>
        ))}
        <Text style={styles.label}>Registered Events:</Text>
        {user.events && user.events.length > 0 ? (
          user.events.map((event) => (
            <Text key={event._id} style={styles.event}>- {event.title}</Text>
          ))
        ) : (
          <Text style={styles.info}>No registered events</Text>
        )}
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
  