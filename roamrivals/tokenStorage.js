import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Save token
export const saveToken = async (token) => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem('jwt', token);
    } else {
      await SecureStore.setItemAsync('jwt', token);
    }
  } catch (error) {
    console.error('Error saving token:', error);
  }
};

// Get token
export const getToken = async () => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem('jwt');
    } else {
      return await SecureStore.getItemAsync('jwt');
    }
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

// Delete token
export const deleteToken = async () => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem('jwt');
    } else {
      await SecureStore.deleteItemAsync('jwt');
    }
  } catch (error) {
    console.error('Error deleting token:', error);
  }
};
