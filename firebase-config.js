// Firebase Configuration - Loaded from environment variables
// For client-side usage, these will be embedded at build time or via Vercel environment variables

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDUERWnHurjAPYm9N7P52sXYXLI2Npux54",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sugarme-9a37d.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sugarme-9a37d",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sugarme-9a37d.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "237083119168",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:237083119168:web:dded20690c03658a9259a5"
};
