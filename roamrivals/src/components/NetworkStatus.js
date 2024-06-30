// src/components/NetworkStatus.js
import React, { useEffect, useContext } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { ErrorContext } from '../context/ErrorContext';

const NetworkStatus = ({ children }) => {
  const { setError } = useContext(ErrorContext);

  useEffect(() => {
    console.log('NetworkStatus mounted');
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Network state changed:', state);
      if (!state.isConnected) {
        setError('Network issue, please check your connection.');
      } else {
        setError(null);
      }
    });

    return () => {
      console.log('NetworkStatus unmounted');
      unsubscribe();
    };
  }, [setError]);

  return children;
};

export default NetworkStatus;
