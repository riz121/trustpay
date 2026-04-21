import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { api } from '../api/apiClient';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications() {
  if (!Device.isDevice) return null; // simulators don't get push tokens

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('dispute-updates', {
      name: 'Dispute Updates',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: '68369ce0-c42d-4e36-a7bb-77fb4e31d1f7',
  });

  return tokenData.data; // "ExponentPushToken[...]"
}

export async function savePushTokenToServer(token) {
  if (!token) return;
  try {
    await api.put('/api/user/push-token', { token });
  } catch (_) {
    // non-fatal
  }
}
