import {View, Text, Platform, Alert, SafeAreaView} from 'react-native';
import React, {useEffect} from 'react';
import {PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';

const App = () => {
  useEffect(() => {
    requestUserPermission();
    // Handle notifications when app is in foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground Message:', remoteMessage);
      Alert.alert(
        remoteMessage.notification?.title || 'New Message',
        remoteMessage.notification?.body,
      );
    });

    // Handle when app is in background and user taps notification
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Background Notification Opened:', remoteMessage);
    });

    // Check if app was opened from a quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Quit State Notification:', remoteMessage);
        }
      });

    return () => {
      unsubscribeForeground();
    };
  }, []);

  const requestUserPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Android Notification permission granted');
            const token = await messaging().getToken();
            console.log('Android FCM Token:', token);
          } else {
            console.log('Android Notification permission denied');
          }
        } else {
          // For Android < 13, permissions are granted during installation
          const token = await messaging().getToken();
          console.log('Android FCM Token:', token);
        }
      }
    } catch (error) {
      console.log('Permission request error:', error);
    }
  };

  return (
    <SafeAreaView>
      <Text>Notifications Test App</Text>
    </SafeAreaView>
  );
};

export default App;
