// src/components/ErrorBoundary.js
import React, { Component } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.errorText}>Something went wrong.</Text>
          <Text style={styles.errorMessage}>{this.state.error.toString()}</Text>
          <Button title="Retry" onPress={() => this.setState({ hasError: false, error: null })} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  errorMessage: {
    fontSize: 16,
    color: 'red',
    marginBottom: 20,
  },
});

export default ErrorBoundary;
