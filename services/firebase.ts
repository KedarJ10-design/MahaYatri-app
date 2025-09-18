// Use the v8 compatibility layer (compat), which provides the v8 namespaced API.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';

// Your web app's Firebase configuration
// This configuration is now exported to be used in other parts of the app, like the error display.
export const firebaseConfig = {
  apiKey: "AIzaSyCdPlC6-0xeYvinxK9jNPOsWzKaB5G_keQ",
  authDomain: "mahayatri-app.firebaseapp.com",
  projectId: "mahayatri-app",
  storageBucket: "mahayatri-app.appspot.com",
  messagingSenderId: "180900962167",
  appId: "1:180900962167:web:e9a41c98a76825b471cb72"
};

// Initialize Firebase only once
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // This critical error prevents the app from running.
    // Display a user-friendly message on the page itself if initialization fails.
    // We must do this *after* the DOM has loaded.
    document.addEventListener('DOMContentLoaded', () => {
        const root = document.getElementById('root');
        if (root) {
            root.innerHTML = `
              <div style="padding: 2rem; text-align: center; font-family: sans-serif; background-color: #fff1f2; color: #b91c1c; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <h1 style="font-size: 1.5rem; font-weight: bold;">Firebase Configuration Error</h1>
                <p style="margin-top: 0.5rem;">The application could not start. Please ensure you have a valid Firebase configuration in <strong>services/firebase.ts</strong>.</p>
              </div>
            `;
        }
    });
    throw new Error("Firebase configuration is missing or invalid. Please update services/firebase.ts.");
  }
}

// Get references to the services
export const auth = firebase.auth();
export const db = firebase.firestore();
export const functions = firebase.functions();
export type FirebaseUser = firebase.User;
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const browserLocalPersistence = firebase.auth.Auth.Persistence.LOCAL;
export const browserSessionPersistence = firebase.auth.Auth.Persistence.SESSION;