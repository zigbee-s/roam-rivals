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

    if (error.response && error.response.status === 403 && !originalRequest._retry) {
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
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;