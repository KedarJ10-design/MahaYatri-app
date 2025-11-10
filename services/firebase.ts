
// FIX: Define types for Vite environment variables to resolve TypeScript errors
// when `vite/client` types are not available in the compilation context.
interface ImportMetaEnv {
    readonly VITE_FIREBASE_API_KEY: string;
    readonly VITE_FIREBASE_AUTH_DOMAIN: string;
    readonly VITE_FIREBASE_PROJECT_ID: string;
    readonly VITE_FIREBASE_STORAGE_BUCKET: string;
    readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
    readonly VITE_FIREBASE_APP_ID: string;
    readonly VITE_RAZORPAY_KEY_ID: string;
    readonly VITE_FIREBASE_VAPID_KEY: string;
}

// FIX: The global augmentation of `ImportMeta` was removed to resolve a type conflict
// with Vite's built-in environment typings, which caused a "Subsequent property declarations"
// error. The local `ImportMetaEnv` interface is kept for type casting.

// Use the v8 compatibility layer (compat), which provides the v8 namespaced API.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import 'firebase/compat/functions';

// Safely access environment variables, providing an empty object as a fallback.
// This prevents runtime errors if the script is run in an environment where
// Vite's environment variables are not injected.
// FIX: Correctly access Vite environment variables to resolve TypeScript error.
const env: Partial<ImportMetaEnv> = (import.meta as any)?.env ?? {};

// Your web app's Firebase configuration is now loaded from environment variables
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

let auth: firebase.auth.Auth | null = null;
let db: firebase.firestore.Firestore | null = null;
let functions: firebase.functions.Functions | null = null;
export let firebaseInitializationError: string | null = null;

// Initialize Firebase only once
if (!firebase.apps.length) {
  // Check if the config is missing or still has placeholder values
  if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("your-firebase-api-key")) {
      firebaseInitializationError = "Firebase configuration is missing. Please copy '.env.example' to '.env.local' and add your project credentials. The app will run in offline/mock mode.";
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