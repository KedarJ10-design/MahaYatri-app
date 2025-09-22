// Use the v8 compatibility layer (compat), which provides the v8 namespaced API.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your actual Firebase config
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

let auth: firebase.auth.Auth | null = null;
let db: firebase.firestore.Firestore | null = null;
let functions: firebase.functions.Functions | null = null;
export let firebaseInitializationError: string | null = null;

// Initialize Firebase only once
if (!firebase.apps.length) {
  // A simple check for placeholder values
  if (firebaseConfig.apiKey.startsWith("YOUR_")) {
      firebaseInitializationError = "Firebase configuration is missing. The app will run in offline/mock mode. Please update services/firebase.ts with your project credentials.";
      console.warn(firebaseInitializationError);
  } else {
    try {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        functions = firebase.functions();

        // Connect to emulators if running locally
        if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
            console.log("Connecting to local Firebase emulators.");
            auth.useEmulator('http://127.0.0.1:9099');
            db.useEmulator('127.0.0.1', 8080);
            functions.useEmulator('127.0.0.1', 5001);
        }
    } catch (error: any) {
        firebaseInitializationError = `Firebase initialization error: ${error.message}`;
        console.error(firebaseInitializationError);
    }
  }
} else {
    // If already initialized, just get the instances
    const app = firebase.app();
    auth = app.auth();
    db = app.firestore();
    functions = app.functions();
}

// Get references to the services
export { auth, db, functions };
export type FirebaseUser = firebase.User;
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export const browserLocalPersistence = firebase.auth.Auth.Persistence.LOCAL;
export const browserSessionPersistence = firebase.auth.Auth.Persistence.SESSION;
