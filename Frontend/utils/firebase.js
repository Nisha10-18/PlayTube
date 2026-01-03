// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {getAuth, GoogleAuthProvider} from "firebase/auth"
// Your web app's Firebase configuration
const firebaseConfig = {
   apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "playtubelogin-1d6fe.firebaseapp.com",
  projectId: "playtubelogin-1d6fe",
  storageBucket: "playtubelogin-1d6fe.firebasestorage.app",
  messagingSenderId: "413325817820",
  appId: "1:413325817820:web:ec4244e1467f9cdea18119"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export {auth,provider}