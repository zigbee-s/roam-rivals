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
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = await getToken('refreshToken');

      if (refreshToken) {
        try {
          const { data } = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
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
        navigate('Login');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
