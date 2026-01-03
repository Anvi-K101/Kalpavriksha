import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Fallback for local development if Vercel variables aren't injected yet
const config = {
  apiKey: firebaseConfig.apiKey || "AIzaSyCkQSl2XJWKlrpU4PWDqqazqwO1nRHfLI4",
  authDomain: firebaseConfig.authDomain || "the-tree-7a6b1.firebaseapp.com",
  projectId: firebaseConfig.projectId || "the-tree-7a6b1",
  storageBucket: firebaseConfig.storageBucket || "the-tree-7a6b1.firebasestorage.app",
  messagingSenderId: firebaseConfig.messagingSenderId || "652498284468",
  appId: firebaseConfig.appId || "1:652498284468:web:239db769174200f3834ce1",
  measurementId: firebaseConfig.measurementId || "G-M4M772475F"
};

const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };