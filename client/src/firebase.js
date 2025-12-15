// client/src/firebase.js

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";        // <--- Added
import { getFirestore } from "firebase/firestore"; // <--- Added

const firebaseConfig = {
  apiKey: "AIzaSyBefetDigQRNLfUOByymn9BxR5crwpJ8Gg",
  authDomain: "aiwbuilder.firebaseapp.com",
  projectId: "aiwbuilder",
  storageBucket: "aiwbuilder.firebasestorage.app",
  messagingSenderId: "553730782258",
  appId: "1:553730782258:web:1e2fc33bbe7483f82c782b",
  measurementId: "G-GWY3CPBZQM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize & Export Services
export const auth = getAuth(app);       // <--- Now you can use this in Login.jsx
export const db = getFirestore(app);    // <--- Now you can use this in Dashboard.jsx
export default app;