// App.js
import React from 'react';
import { UserProvider } from './src/context/UserContext';
import { ErrorProvider } from './src/context/ErrorContext';
import NetworkStatus from './src/components/NetworkStatus';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';

const App = () => {
  return (
    <UserProvider>
      <ErrorProvider>
        <ErrorBoundary>
          <NetworkStatus>
            <AppNavigator />
          </NetworkStatus>
        </ErrorBoundary>
      </ErrorProvider>
    </UserProvider>
  );
};

export default App;
