// tokenStorage.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Function to split a string into chunks of specified size
const splitString = (str, size) => {
  const numChunks = Math.ceil(str.length / size);
  const chunks = new Array(numChunks);

  for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
    chunks[i] = str.substr(o, size);
  }

  return chunks;
};

// Function to combine chunks into a single string
const combineChunks = (chunks) => chunks.join('');

// Function to get item from storage
const getItem = async (key) => {
  try {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      const chunkCount = await AsyncStorage.getItem(`${key}_chunkCount`);
      if (chunkCount) {
        const chunks = [];
        for (let i = 0; i < Number(chunkCount); i++) {
          const chunk = await SecureStore.getItemAsync(`${key}_chunk${i}`);
          chunks.push(chunk);
        }
        return combineChunks(chunks);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    }
  } catch (error) {
    console.error('Error getting item from storage:', error);
    return null;
  }
};

// Function to set item in storage
const setItem = async (key, value) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      const CHUNK_SIZE = 2048;
      const chunks = splitString(value, CHUNK_SIZE);

      if (chunks.length > 1) {
        await AsyncStorage.setItem(`${key}_chunkCount`, chunks.length.toString());
        for (let i = 0; i < chunks.length; i++) {
          await SecureStore.setItemAsync(`${key}_chunk${i}`, chunks[i]);
        }
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    }
  } catch (error) {
    console.error('Error setting item in storage:', error);
  }
};

// Function to delete item from storage
const deleteItem = async (key) => {
  try {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      const chunkCount = await AsyncStorage.getItem(`${key}_chunkCount`);
      if (chunkCount) {
        for (let i = 0; i < Number(chunkCount); i++) {
          await SecureStore.deleteItemAsync(`${key}_chunk${i}`);
        }
        await AsyncStorage.removeItem(`${key}_chunkCount`);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    }
  } catch (error) {
    console.error('Error deleting item from storage:', error);
  }
};

export const getToken = async (key = 'jwt') => getItem(key);
export const saveToken = async (token, key = 'jwt') => setItem(key, token);
export const deleteToken = async (key = 'jwt') => deleteItem(key);
