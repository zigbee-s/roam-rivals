// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignupScreen from './screens/SignupScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import HomeScreen from './screens/HomeScreen';
import EventScreen from './screens/EventScreen';
import CreateEventScreen from './screens/CreateEventScreen';
import AddQuestionsScreen from './screens/AddQuestionsScreen';
import { getToken } from './tokenStorage';
import { ActivityIndicator, Button, View } from 'react-native';
import apiClient from './apiClient';

const Stack = createNativeStackNavigator();

const App = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
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
    <NavigationContainer>
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
    </NavigationContainer>
  );
};

export default App;
