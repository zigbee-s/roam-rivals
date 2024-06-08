import axios from 'axios';
import { getToken, saveToken } from './tokenStorage';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000', // Update to your server URL
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  console.log('Token Used for API Request:', token); // Debugging
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.log("Unauthorized - Clearing Token"); // Debugging
      await saveToken(null); // Clear token from AsyncStorage
      // Handle navigation to login if needed
    }
    return Promise.reject(error);
  }
);

export default apiClient;
