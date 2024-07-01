// roamrivals/src/api/tokenStorage.js

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';
const CHUNK_SIZE = 1024; // Adjust based on your needs

const chunkData = (data) => {
  const chunks = [];
  for (let i = 0; i < data.length; i += CHUNK_SIZE) {
    chunks.push(data.slice(i, i + CHUNK_SIZE));
  }
  return chunks;
};

const saveToken = async (token, key = 'jwt') => {
  try {
    if (isWeb) {
      localStorage.setItem(key, token);
    } else {
      const chunks = chunkData(token);
      await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString());
      for (let i = 0; i < chunks.length; i++) {
        await AsyncStorage.setItem(`${key}_chunk_${i}`, chunks[i]);
      }
    }
  } catch (error) {
    console.error('Failed to save token', error);
  }
};

const getToken = async (key = 'jwt') => {
  try {
    if (isWeb) {
      return localStorage.getItem(key);
    } else {
      const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
      if (!chunkCount) return null;
      let token = '';
      for (let i = 0; i < parseInt(chunkCount); i++) {
        const chunk = await AsyncStorage.getItem(`${key}_chunk_${i}`);
        if (chunk) {
          token += chunk;
        } else {
          return null;
        }
      }
      return token;
    }
  } catch (error) {
    console.error('Failed to get token', error);
  }
};

const deleteToken = async (key = 'jwt') => {
  try {
    if (isWeb) {
      localStorage.removeItem(key);
    } else {
      const chunkCount = await SecureStore.getItemAsync(`${key}_chunks`);
      if (chunkCount) {
        await SecureStore.deleteItemAsync(`${key}_chunks`);
        for (let i = 0; i < parseInt(chunkCount); i++) {
          await AsyncStorage.removeItem(`${key}_chunk_${i}`);
        }
      }
    }
  } catch (error) {
    console.error('Failed to delete token', error);
  }
};

const getRefreshToken = async () => {
  return getToken('refreshToken');
};

const saveRefreshToken = async (token) => {
  return saveToken(token, 'refreshToken');
};

const deleteRefreshToken = async () => {
  return deleteToken('refreshToken');
};

export { saveToken, getToken, deleteToken, getRefreshToken, saveRefreshToken, deleteRefreshToken };
