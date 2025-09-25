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

      // 1. Request Permission from the user
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted.');
        
        // 2. Get the FCM registration token from the browser's push service
        const token = await messaging.getToken({
            // THIS VAPID KEY IS PUBLIC AND SAFE TO EXPOSE. It's used by push services to identify the application server.
            // Replace with your actual VAPID key from Project Settings > Cloud Messaging > Web configuration
            vapidKey: 'BJEzX-1fA3oJg...YOUR_PUBLIC_VAPID_KEY_HERE...mY5c' 
        });

        if (token) {
          console.log('FCM Token:', token);
          // 3. Save the token to the user's profile in Firestore
          const userDocRef = db.collection('users').doc(userId);
          await userDocRef.update({ fcmToken: token });
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      } else {
        console.log('Unable to get permission to notify.');
      }
    } catch (err) {
      console.error('An error occurred while initializing FCM. ', err);
    }
  } else {
      console.log('Firebase Messaging is not supported in this browser.');
  }
};