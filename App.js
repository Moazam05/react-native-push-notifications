import {View, Text, Platform, Alert, SafeAreaView} from 'react-native';
import React, {useEffect} from 'react';
import {PermissionsAndroid} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {
  AndroidColor,
  AndroidImportance,
  EventType,
} from '@notifee/react-native';

const App = () => {
  useEffect(() => {
    requestUserPermission();
    // Handle notifications when app is in foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground Message:', remoteMessage);
      // Alert.alert(
      //   remoteMessage.notification?.title || 'New Message',
      //   remoteMessage.notification?.body,
      // );
      onDisplayNotification(remoteMessage);
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
  const onDisplayNotification = async remoteMessage => {
    try {
      // Log the incoming message
      console.log('Attempting to display notification:', remoteMessage);

      // Request permissions (required for iOS)
      const settings = await notifee.requestPermission();
      // console.log('Permission settings:', settings);

      // Create a channel (required for Android)
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
        importance: AndroidImportance.HIGH,
      });
      // console.log('Channel created with ID:', channelId);

      // Display notification
      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        android: {
          channelId,
          smallIcon: 'ic_launcher', // Use your app's launcher icon as fallback
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
      });
      // console.log('Notification displayed successfully');
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  };

  // Add notification action handler
  notifee.onBackgroundEvent(async ({type, detail}) => {
    const {notification, pressAction} = detail;

    // Check if the user pressed the notification
    if (type === EventType.PRESS) {
      // Handle different action presses
      switch (pressAction.id) {
        case 'view':
          // Handle view action
          break;
        case 'dismiss':
          // Handle dismiss action
          await notifee.cancelNotification(notification.id);
          break;
        default:
          // Handle default press
          break;
      }
    }
  });

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
