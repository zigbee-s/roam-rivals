// roamrivals/tokenStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const Storage = {
  getItem: async (key) => {
    return Platform.OS === 'web' ? AsyncStorage.getItem(key) : SecureStore.getItemAsync(key);
  },
  setItem: async (key, value) => {
    return Platform.OS === 'web' ? AsyncStorage.setItem(key, value) : SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key) => {
    return Platform.OS === 'web' ? AsyncStorage.removeItem(key) : SecureStore.deleteItemAsync(key);
  },
};

export const getToken = async (key = 'jwt') => Storage.getItem(key);
export const saveToken = async (token, key = 'jwt') => Storage.setItem(key, token);
export const deleteToken = async (key = 'jwt') => Storage.deleteItem(key);
