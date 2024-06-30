// src/components/NetworkStatus.js
import React, { useEffect, useContext } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ErrorContext } from '../context/ErrorContext';

const NetworkStatus = ({ children }) => {
  const { setError } = useContext(ErrorContext);

  const checkNetworkStatus = () => {
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        setError('Network issue, please check your connection.');
      } else {
        setError(null);
      }
    });
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!state.isConnected) {
        setError('Network issue, please check your connection.');
      } else {
        setError(null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setError]);

  return children;
};

export default NetworkStatus;

