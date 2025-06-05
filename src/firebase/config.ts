import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAxb-2MbmQUMJpk_HEQcD5eKohMgGDf1zs",
  authDomain: "task-sys.firebaseapp.com",
  projectId: "task-sys",
  storageBucket: "task-sys.firebasestorage.app",
  messagingSenderId: "415895998115",
  appId: "1:415895998115:web:b13deda4bc23418c82f916",
  measurementId: "G-C92B1KGGQ6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };