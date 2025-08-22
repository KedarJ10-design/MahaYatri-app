// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";

// Your web app's Firebase configuration
// These values are loaded from environment variables in the execution environment.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

let authInstance: Auth | null = null;

// Only initialize Firebase if the API key is provided and valid.
if (firebaseConfig.apiKey) {
  try {
    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  } catch(e: any) {
    console.error("Firebase initialization failed:", e.message);
    // This will catch auth/invalid-api-key if other keys are present but the main key is bad.
  }
} else {
  console.log("Firebase configuration not found. MahaYatri will run in Demo Mode.");
}


// Initialize Firebase Authentication and get a reference to the service
export const auth = authInstance;
export const googleProvider = new GoogleAuthProvider();