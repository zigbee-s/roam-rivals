// roamrivals/src/api/apiClient.js
import axios from 'axios';
import { getToken, saveToken, deleteToken, getRefreshToken, saveRefreshToken, deleteRefreshToken } from './tokenStorage';
import { navigationRef } from './navigationRef';
import uuid from 'react-native-uuid';

const devURL = 'http://localhost:3000';
const uatURL = 'http://192.168.1.7:3000';
const prodURL = 'https://roam-rivals.onrender.com';
const ngrokURL = 'https://964e-223-233-87-17.ngrok-free.app'; // Update this to your current ngrok URL

// Determine the base URL based on environment
let baseURL;

if (process.env.NODE_ENV === 'production') {
  baseURL = prodURL;
} else if (process.env.NODE_ENV === 'uat') {
  baseURL = uatURL;
} else {
  baseURL = ngrokURL;
}

baseURL = prodURL
console.log("Base URL: " + baseURL);

const apiClient = axios.create({
  baseURL,
  timeout: 20000, // Set a 20-second timeout for requests
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method === 'post') {
      const idempotencyKey = uuid.v4();
      config.headers['Idempotency-Key'] = idempotencyKey;
    }

    return config;
  } catch (error) {
    console.error("Error in request interceptor:", error);
    return Promise.reject(error);
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      // Access token expired
      if (error.response.status === 401 && error.response.data.message === 'TokenExpiredError' && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = await getRefreshToken();
        if (refreshToken) {
          try {
            const idempotencyKey = uuid.v4();
            const { data } = await axios.post(`${baseURL}/auth/refresh-token`, 
              { refreshToken },
              { headers: { 'Idempotency-Key': idempotencyKey } }
            );
            await saveToken(data.token);
            await saveRefreshToken(data.refreshToken);
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            originalRequest.headers['Idempotency-Key'] = uuid.v4(); // Add idempotency key to original request
            return apiClient(originalRequest);
          } catch (refreshError) {
            console.error("Error refreshing token:", refreshError);
            await deleteToken();
            await deleteRefreshToken();
            navigationRef.navigate('Login');
          }
        } else {
          navigationRef.navigate('Login');
        }
      }

      // Invalid refresh token
      if (error.response.status === 403 && error.response.data.message === 'Invalid refresh token') {
        console.error("Invalid refresh token");
        await deleteToken();
        await deleteRefreshToken();
        navigationRef.navigate('Login');
      }

      if (error.response.status === 404 && error.response.data.message === 'User not found') {
        console.error("User not found");
        await deleteToken();
        await deleteRefreshToken();
        navigationRef.navigate('Login');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
