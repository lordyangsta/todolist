// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC3y_QBdSEdKQ6y9tBdNjR5H-6rcUU7bbU",
  authDomain: "danieltodo-a6faf.firebaseapp.com",
  projectId: "danieltodo-a6faf",
  storageBucket: "danieltodo-a6faf.appspot.com",
  messagingSenderId: "673151916642",
  appId: "1:673151916642:web:1bd3bf0418f725e50d0f3b",
  measurementId: "G-K7B0PY1K17"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);