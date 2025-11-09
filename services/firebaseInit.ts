import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, Firestore } from 'firebase/firestore';

// Your web app's Firebase configuration provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyB3irx0Hb4lVypD5GpOdk_sKbQedmGgSBI",
  authDomain: "logistic-si-soluciones.firebaseapp.com",
  projectId: "logistic-si-soluciones",
  storageBucket: "logistic-si-soluciones.appspot.com",
  messagingSenderId: "63354489563",
  appId: "1:63354489563:web:f82881c266e2df93a99afe",
  measurementId: "G-H3B53C9W7P"
};

// Initialize Firebase App and Firestore, ensuring it only happens once
const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app);

// Enable offline persistence for a better offline experience
enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.warn('Firestore persistence failed: multiple tabs open.');
    } else if (err.code == 'unimplemented') {
      // The current browser does not support all of the features required to enable persistence
      console.warn('Firestore persistence not available in this browser.');
    }
  });

// Export the initialized db instance for use in other services
export { db };