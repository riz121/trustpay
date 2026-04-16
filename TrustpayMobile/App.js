import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { QueryProvider } from './src/context/QueryContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <QueryProvider>
          <NavigationContainer>
            <StatusBar style="light" backgroundColor="#0a0a0f" />
            <AppNavigator />
          </NavigationContainer>
        </QueryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
