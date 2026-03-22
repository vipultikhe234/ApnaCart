import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { Capacitor } from '@capacitor/core';

export const initializeFirebase = async () => {
    if (Capacitor.getPlatform() === 'web') return;

    try {
        // Request permissions for push notifications
        const result = await FirebaseMessaging.requestPermissions();
        if (result.receive === 'granted') {
            await FirebaseMessaging.register();
            
            // Log for debugging (you can remove this later)
            const tokenResult = await FirebaseMessaging.getToken();
            console.log('Firebase Token:', tokenResult.token);
        }

        // Initialize Analytics
        await FirebaseAnalytics.setCollectionEnabled({ enabled: true });
        
        // Listeners for Push Notifications
        await FirebaseMessaging.addListener('notificationReceived', (event) => {
            console.log('Notification received:', event.notification);
        });

        await FirebaseMessaging.addListener('notificationActionPerformed', (event) => {
            console.log('Notification action performed:', event.notification);
        });

    } catch (error) {
        console.error('Firebase Initialization Error:', error);
    }
};

export const logEvent = async (name, params = {}) => {
    if (Capacitor.getPlatform() === 'web') return;
    await FirebaseAnalytics.logEvent({ name, params });
};
