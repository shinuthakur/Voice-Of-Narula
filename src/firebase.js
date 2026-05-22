// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD9at_Q8Qy-xCGeFeK0c4WePOaKkoZ_Wao",
  authDomain: "voice-of-narula.firebaseapp.com",
  projectId: "voice-of-narula",
  databaseURL: "https://voice-of-narula-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "voice-of-narula.firebasestorage.app",
  messagingSenderId: "41589128204",
  appId: "1:41589128204:web:1b6aa775e70fd7f3900229",
  measurementId: "G-C1QYBQSR84",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);