import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDzCrbBZlb0wZ1jzbWVyhC5_ScrrKLz548",
  authDomain: "finchat-8e51b.firebaseapp.com",
  projectId: "finchat-8e51b",
  storageBucket: "finchat-8e51b.firebasestorage.app",
  messagingSenderId: "579534887392",
  appId: "1:579534887392:web:196163b302d621ce3cb385",
  measurementId: "G-V2NZN8WS7G"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
