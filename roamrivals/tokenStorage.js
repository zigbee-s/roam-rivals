import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const Storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    } else {
      return SecureStore.getItemAsync(key);
    }
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    } else {
      return SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    } else {
      return SecureStore.deleteItemAsync(key);
    }
  },
};

export const getToken = async (key = 'jwt') => {
  try {
    const token = await Storage.getItem(key);
    return token ? JSON.parse(token) : null;
  } catch (error) {
    console.log('Error getting token from storage', error);
    return null;
  }
};

export const saveToken = async (token, key = 'jwt') => {
  try {
    await Storage.setItem(key, JSON.stringify(token));
  } catch (error) {
    console.log('Error saving token to storage', error);
  }
};

export const deleteToken = async (key = 'jwt') => {
  try {
    await Storage.removeItem(key);
  } catch (error) {
    console.log('Error deleting token from storage', error);
  }
};
