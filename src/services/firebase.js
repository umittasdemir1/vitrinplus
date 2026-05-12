import { initializeApp } from 'firebase/app';
import {
  collection,
  deleteField,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
} from 'firebase/auth';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCUls3pq9XjyDPLEeraPfs_2gSI3wYP28k',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'vitrinplus-91045.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'vitrinplus-91045',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'vitrinplus-91045.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '2886727272',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:2886727272:web:10def8c1dc594749702ddd',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-R87M8ZL406',
};

try {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);
  const storage = getStorage(app);

  window.firebase = {
    app,
    db,
    auth,
    storage,
    collection,
    doc,
    setDoc,
    getDocs,
    onSnapshot,
    updateDoc,
    deleteField,
    signInAnonymously,
    onAuthStateChanged,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    ready: true,
  };

  window.dispatchEvent(new Event('firebaseReady'));
} catch (error) {
  console.error('Firebase yükleme hatası:', error);
  window.firebase = { ready: false, error: error.message };
}
