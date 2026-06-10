import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAP3cfZQYXNE9PvPCMbNqHCm7-qRO-QN5A",
  authDomain: "project-flow-4c5dc.firebaseapp.com",
  projectId: "project-flow-4c5dc",
  storageBucket: "project-flow-4c5dc.firebasestorage.app",
  messagingSenderId: "945068537653",
  appId: "1:945068537653:web:b14fa27806c998e1427e7c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
