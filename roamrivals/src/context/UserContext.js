// src/context/UserContext.js
import React, { createContext, useState, useEffect } from 'react';
import { getToken, saveToken, deleteToken } from '../api/tokenStorage';
import apiClient from '../api/apiClient';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const cachedUser = await getToken('user');
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
          setLoading(false);
        } else {
          const token = await getToken();
          if (token) {
            const response = await apiClient.get('/user/profile', {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUser(response.data);
            await saveToken(JSON.stringify(response.data), 'user');
          }
        }
      } catch (error) {
        console.error('Failed to fetch user info', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const updateUserProfile = async () => {
    const token = await getToken();
    if (token) {
      const response = await apiClient.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
      await saveToken(JSON.stringify(response.data), 'user');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, setLoading, updateUserProfile }}>
      {children}
    </UserContext.Provider>
  );
};
