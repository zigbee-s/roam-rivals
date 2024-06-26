// roamrivals/screens/ProfileScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { deleteToken, getToken } from '../tokenStorage';
import apiClient from '../apiClient';

const ProfileScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUserInfo();

    return () => {
      isMounted = false;
      setUserInfo(null);
    };
  }, []);

  const handleLogout = async () => {
    await deleteToken();
    await deleteToken('refreshToken');
    navigation.navigate('Home');
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!userInfo) {
    return <Text>Failed to load user info</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.info}>{userInfo.name}</Text>
        <Text style={styles.label}>Username:</Text>
        <Text style={styles.info}>{userInfo.username}</Text>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.info}>{userInfo.email}</Text>
        <Text style={styles.label}>Age:</Text>
        <Text style={styles.info}>{userInfo.age}</Text>
        <Text style={styles.label}>Roles:</Text>
        {userInfo.roles.map((role, index) => (
          <Text key={index} style={styles.info}>{role}</Text>
        ))}
        <Text style={styles.label}>Registered Events:</Text>
        {userInfo.events && userInfo.events.length > 0 ? (
          userInfo.events.map((event) => (
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
