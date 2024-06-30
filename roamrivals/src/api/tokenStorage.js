import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const Storage = {
  getItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  },
  deleteItem: async (key) => {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error('Error deleting item from storage:', error);
    }
  },
};

export const getToken = async (key = 'jwt') => Storage.getItem(key);
export const saveToken = async (token, key = 'jwt') => Storage.setItem(key, token);
export const deleteToken = async (key = 'jwt') => Storage.deleteItem(key);
