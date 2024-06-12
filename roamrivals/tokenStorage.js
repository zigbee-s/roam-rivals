// tokenStorage.js
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
  deleteItem: async (key) => {
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    } else {
      return SecureStore.deleteItemAsync(key);
    }
  },
};

export const getToken = async (key = 'jwt') => {
  return Storage.getItem(key);
};

export const saveToken = async (token, key = 'jwt') => {
  await Storage.setItem(key, token);
};

export const deleteToken = async (key = 'jwt') => {
  await Storage.deleteItem(key);
};
