import React, { useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, ActivityIndicator, View } from 'react-native';
import SignupScreen from '../screens/SignupScreen';
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import EventScreen from '../screens/EventScreen';
import CreateEventScreen from '../screens/CreateEventScreen';
import AddQuestionsScreen from '../screens/AddQuestionsScreen';
import { getToken } from '../api/tokenStorage';
import apiClient from '../api/apiClient';
import { navigationRef } from '../api/navigationRef';
import ErrorScreen from '../components/ErrorScreen';
import { ErrorContext } from '../context/ErrorContext';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const { error } = useContext(ErrorContext);

  useEffect(() => {
    console.log('AppNavigator mounted');
    const checkToken = async () => {
      const token = await getToken();
      if (token) {
        setInitialRoute('Events');
        fetchUserRoles(token);
      } else {
        setInitialRoute('Home');
      }
    };

    const fetchUserRoles = async (token) => {
      try {
        const response = await apiClient.get('/user/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRoles(response.data.roles);
      } catch (error) {
        console.log('Failed to fetch user roles');
      }
    };

    checkToken();

    return () => {
      console.log('AppNavigator unmounted');
    };
  }, []);

  const profileButton = ({ navigation }) => ({
    headerRight: () => (
      <Button
        onPress={() => navigation.navigate('Profile')}
        title="Profile"
      />
    ),
  });

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {error ? (
        <ErrorScreen onRetry={() => window.location.reload()} />
      ) : (
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} setUserRoles={setUserRoles} />}
          </Stack.Screen>
          <Stack.Screen name="Profile" component={ProfileScreen} options={profileButton} />
          <Stack.Screen name="Events" options={profileButton}>
            {(props) => <EventScreen {...props} userRoles={userRoles} />}
          </Stack.Screen>
          <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={profileButton} />
          <Stack.Screen name="AddQuestions" component={AddQuestionsScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
