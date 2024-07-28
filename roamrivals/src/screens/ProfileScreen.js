import React, { useContext, useCallback } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { UserContext } from '../context/UserContext';
import { deleteToken } from '../api/tokenStorage';
import { Ionicons } from '@expo/vector-icons';

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

  const isAdmin = user.roles.includes('admin');

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.info}>{user.name}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.info}>{user.username}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.info}>{user.email}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Age:</Text>
            <Text style={styles.info}>{user.age}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Roles:</Text>
            {user.roles.map((role, index) => (
              <Text key={index} style={styles.info}>{role}</Text>
            ))}
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.label}>Registered Events:</Text>
            {user.events && user.events.length > 0 ? (
              user.events.map((event) => (
                <Text key={event._id} style={styles.event}>- {event.title}</Text>
              ))
            ) : (
              <Text style={styles.info}>No registered events</Text>
            )}
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Logout" onPress={handleLogout} color="#000A23" />
            {isAdmin && (
              <Button title="Create Event" onPress={() => navigation.navigate('CreateEvent')} color="#000A23" />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
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
    color: '#1a1a2e',
  },
  infoContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a2e',
  },
  info: {
    fontSize: 16,
    color: '#666',
  },
  event: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  buttonContainer: {
    marginTop: 20,
  },
});

export default ProfileScreen;
