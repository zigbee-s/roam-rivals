import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'jwt';

async function secureStoreSave(value, key = TOKEN_KEY) {
  await SecureStore.setItemAsync(key, value);
}

async function secureStoreGet(key = TOKEN_KEY) {
  return await SecureStore.getItemAsync(key);
}

async function secureStoreDelete(key = TOKEN_KEY) {
  await SecureStore.deleteItemAsync(key);
}

function webStoreSave(value, key = TOKEN_KEY) {
  if (value !== null && value !== undefined) {
    localStorage.setItem(key, value);
  }
}

function webStoreGet(key = TOKEN_KEY) {
  return localStorage.getItem(key);
}

function webStoreDelete(key = TOKEN_KEY) {
  localStorage.removeItem(key);
}

const isWeb = Platform.OS === 'web';

export async function saveToken(value, key = TOKEN_KEY) {
  if (isWeb) {
    webStoreSave(value, key);
  } else {
    await secureStoreSave(value, key);
  }
}

export async function getToken(key = TOKEN_KEY) {
  return isWeb ? webStoreGet(key) : await secureStoreGet(key);
}

export async function deleteToken(key = TOKEN_KEY) {
  if (isWeb) {
    webStoreDelete(key);
  } else {
    await secureStoreDelete(key);
  }
}
