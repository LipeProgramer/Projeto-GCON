import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCkNEubMjzFIAJICbi80yeEujlCTdUH73Y",
  authDomain: "vistorias-imoveis-web.firebaseapp.com",
  projectId: "vistorias-imoveis-web",
  storageBucket: "vistorias-imoveis-web.firebasestorage.app",
  messagingSenderId: "961549142479",
  appId: "1:961549142479:web:9ceec33e41c509cfe4eaba",
  measurementId: "G-6NH1JRM1EH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);