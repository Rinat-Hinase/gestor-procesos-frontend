// src/services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVd0kMk55bJ98e43VJDcx6QFnAgNguRgg",
  authDomain: "gestor-procesos.firebaseapp.com",
  projectId: "gestor-procesos",
  storageBucket: "gestor-procesos.firebasestorage.app",
  messagingSenderId: "955176372572",
  appId: "1:955176372572:web:a981df953b10595a299999"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);