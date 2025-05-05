
import { initializeApp, getApps, getApp, FirebaseOptions, serverTimestamp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
 import { getMessaging } from "firebase/messaging"; // Uncomment if FCM is needed

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validate that all required Firebase config values are present
const requiredConfigKeys: (keyof FirebaseOptions)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

let app;
let auth: ReturnType<typeof getAuth>;
let db: ReturnType<typeof getFirestore>;
let storage: ReturnType<typeof getStorage>;
 let messaging: ReturnType<typeof getMessaging> | null = null;

if (missingKeys.length > 0) {
  console.error(
    `Firebase initialization failed: Missing environment variables: ${missingKeys.join(', ')}. ` +
    'Please ensure all NEXT_PUBLIC_FIREBASE_* variables are set in your .env.local file.'
  );
  // You might want to throw an error or handle this case differently depending on your app's needs.
  // For now, we'll prevent initialization and subsequent errors.
  // You could provide mock instances or throw an error.
  // throw new Error(`Missing Firebase config keys: ${missingKeys.join(', ')}`);
} else {
  // Initialize Firebase only if config is valid
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  // messaging = typeof window !== 'undefined' ? getMessaging(app) : null; // Initialize only on client
}

// Export potentially undefined instances if initialization failed
export { app, auth, db, storage, serverTimestamp /*, messaging*/ }; // Export messaging if needed
