import axios from 'axios';
import { getToken, saveToken, deleteToken } from './tokenStorage';

devURL = 'http://localhost:3000'
prodURL = 'https://roam-rivals.onrender.com'

baseurl = devURL

const apiClient = axios.create({
  baseURL: baseurl, // Update to your server URL
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error response has the correct structure
    if (error.response && error.response.data && error.response.data.code) {
      const { code } = error.response.data;
      
      // If error code is TOKEN_EXPIRED, try to refresh the token
      if (code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
        originalRequest._retry = true;
        const refreshToken = await getToken('refreshToken');
      
        if (refreshToken) {
          try {
            const { data } = await axios.post(baseurl + '/auth/refresh-token', { refreshToken });
            await saveToken(data.token, 'jwt');
            await saveToken(data.refreshToken, 'refreshToken');
            originalRequest.headers.Authorization = `Bearer ${data.token}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            console.log('Refresh token expired or invalid');
            await deleteToken();
            await deleteToken('refreshToken');
            // Optionally, redirect to login page
          }
        }
      }
      // Handle other error codes and messages appropriately
      else if (code === 'NO_REFRESH_TOKEN' || code === 'INVALID_REFRESH_TOKEN') {
        await deleteToken();
        await deleteToken('refreshToken');
        // Optionally, redirect to login page
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
