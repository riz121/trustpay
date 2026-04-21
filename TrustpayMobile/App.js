import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import { QueryProvider } from './src/context/QueryContext';
import AppNavigator from './src/navigation/AppNavigator';

function App() {
  const navigationRef = useRef(null);

  useEffect(() => {
    // Handle notification tap — navigate to TransactionDetail
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'dispute_update' && data?.transaction_id) {
        navigationRef.current?.navigate('TransactionDetail', {
          transactionId: data.transaction_id,
        });
      }
    });
    return () => sub.remove();
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <QueryProvider>
          <NavigationContainer ref={navigationRef}>
            <StatusBar style="light" backgroundColor="#0a0a0f" />
            <AppNavigator />
          </NavigationContainer>
        </QueryProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

registerRootComponent(App);
