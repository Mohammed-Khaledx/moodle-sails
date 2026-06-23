import { useState, useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Handle foreground notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function usePushNotifications() {
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [liveAlerts, setLiveAlerts] = useState<any[]>([]);
    // Track the current notification selected via banner deep linking
    const [tappedNotification, setTappedNotification] = useState<any | null>(null);
    
    const notificationListener = useRef<any>(null);
    const responseListener = useRef<any>(null);

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setFcmToken(token ?? null));

        // Listener: Runs when a notification arrives while the app is active
        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            const customData = notification.request.content.data || 
                               (notification.request.trigger as any)?.remoteMessage?.data;
            
            if (customData) {
                setLiveAlerts(prev => [
                    {
                        id: customData.messageid || Math.random().toString(),
                        title: customData.title || 'Sails Alert',
                        body: customData.body || 'New update message package received',
                        courseid: customData.courseid || '0'
                    },
                    ...prev
                ]);
            }
        });

        // Listener: Runs when a user clicks a notification banner from their device tray
        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            const customData = response.notification.request.content.data || 
                               (response.notification.request.trigger as any)?.remoteMessage?.data;
            
            if (customData) {
                console.log('🎯 Deep Link Event Captured:', customData);
                // Hydrate the tapped navigation hook route state
                setTappedNotification({
                    id: customData.messageid || '0',
                    title: customData.title || 'Sails Alert',
                    body: customData.body || '',
                    courseid: customData.courseid || '0'
                });
            }
        });

        return () => {
            notificationListener.current?.remove();
            responseListener.current?.remove();
        };
    }, []);

    return { fcmToken, liveAlerts, tappedNotification, setTappedNotification };
}

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (!Device.isDevice) {
        console.log('Execution Warning: Must use physical device for native Push Notifications');
        return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        console.log('Execution Fault: Failed to get push token for notification permissions!');
        return;
    }

    const token = (await Notifications.getDevicePushTokenAsync()).data;
    return token;
}