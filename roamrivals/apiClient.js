// roamrivals/apiClient.js
import axios from 'axios';
import { getToken, saveToken, deleteToken } from './tokenStorage';
import { navigate } from './navigationRef';
import { v4 as uuidv4 } from 'uuid';


const devURL = 'http://localhost:3000';
const prodURL = 'https://roam-rivals.onrender.com';
let baseURL = process.env.NODE_ENV === 'production' ? prodURL : devURL;

console.log("sdsadsa: " + prodURL)

baseURL = prodURL
const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use(async (config) => {
  console.log(prodURL)
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Generate and add idempotency key for POST requests
  if (config.method === 'post') {
    config.headers['Idempotency-Key'] = uuidv4();
  }

  console.log(config)
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
          const { data } = await axios.post(`${baseURL}/auth/refresh-token`, { refreshToken });
          await saveToken(data.token, 'jwt');
          await saveToken(data.refreshToken, 'refreshToken');
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
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
