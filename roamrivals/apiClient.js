// roamrivals/apiClient.js
import axios from 'axios';
import { getToken, saveToken, deleteToken } from './tokenStorage';
import { navigate } from './navigationRef';
import uuid from 'react-native-uuid';

const devURL = 'http://localhost:3000';
const prodURL = 'https://roam-rivals.onrender.com';
let baseURL = process.env.NODE_ENV === 'production' ? prodURL : devURL;

baseURL = prodURL
console.log("Base URL: " + baseURL);

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use(async (config) => {
  try {
    console.log("Entering request interceptor");
    const token = await getToken();
    console.log("Retrieved token:", token);

    if (token) {
      console.log("Setting Authorization header with token:", token);
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.method === 'post') {
      const idempotencyKey = uuid.v4();
      console.log("Generated Idempotency-Key:", idempotencyKey);
      config.headers['Idempotency-Key'] = idempotencyKey;
    }

    console.log("Request config after setting headers:", config);
    return config;
  } catch (error) {
    console.error("Error in request interceptor:", error);
    return Promise.reject(error);
  }
});

apiClient.interceptors.response.use(
  (response) => {
    console.log("Response received:", response);
    return response;
  },
  async (error) => {
    console.error("Response error received:", error);
    const originalRequest = error.config;

    if (error.response && error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getToken('refreshToken');

      if (refreshToken) {
        try {
          console.log("Attempting to refresh token");
          const { data } = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
          console.log("Token refreshed successfully:", data);
          await saveToken(data.token, 'jwt');
          await saveToken(data.refreshToken, 'refreshToken');
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError);
          await deleteToken();
          await deleteToken('refreshToken');
          navigate('Login');
        }
      } else {
        console.log("No refresh token available, navigating to Login");
        navigate('Login');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
