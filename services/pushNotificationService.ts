import firebase from 'firebase/compat/app';
import 'firebase/compat/messaging';
import { db, firebaseConfig } from './firebase';

// This flag prevents re-initialization on hot reloads
let isFCMInitialized = false;

export const initializeFCM = async (userId: string) => {
  if (isFCMInitialized || !db) {
    return;
  }
  
  // Firebase messaging requires a separate initialization check
  if (firebase.messaging.isSupported()) {
    isFCMInitialized = true;
    try {
      // Initialize using the same config as the main app
      const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();
      const messaging = app.messaging();

      // Safely access environment variables
      const env = (import.meta as any)?.env ?? {};
      const vapidKey = env.VITE_FIREBASE_VAPID_KEY;
      
      if (!vapidKey || vapidKey.includes('your-fcm-vapid-key')) {
        console.error("VAPID key for push notifications is not configured. Please set VITE_FIREBASE_VAPID_KEY in your .env.local file (see .env.example). Notifications will not work.");
        return;
      }

      // 1. Request Permission from the user
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        
        // 2. Get the FCM registration token from the browser's push service
        const token = await messaging.getToken({
            vapidKey: vapidKey
        });

        if (token) {
          // 3. Save the token to the user's profile in Firestore
          const userDocRef = db.collection('users').doc(userId);
          await userDocRef.update({ fcmToken: token });
        }
      }
    } catch (err) {
      console.error('An error occurred while initializing FCM. ', err);
    }
  }
};