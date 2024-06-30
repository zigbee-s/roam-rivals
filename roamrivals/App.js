// App.js
import React, { useEffect } from 'react';
import { UserProvider } from './src/context/UserContext';
import { ErrorProvider } from './src/context/ErrorContext';
import NetworkStatus from './src/components/NetworkStatus';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

const App = () => {
  useEffect(() => {
    console.log('App mounted');
    return () => console.log('App unmounted');
  }, []);

  return (
    <UserProvider>
      <ErrorProvider>
        <ErrorBoundary>
            <AppNavigator />
        </ErrorBoundary>
      </ErrorProvider>
    </UserProvider>
  );
};

export default App;
