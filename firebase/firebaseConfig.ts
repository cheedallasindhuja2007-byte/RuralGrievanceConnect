// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyARIGy5IFH6wgMKE-9Cz3fpqZ16md7izOY",
  authDomain: "ruralgrievanceconnect.firebaseapp.com",
  projectId: "ruralgrievanceconnect",
  storageBucket: "ruralgrievanceconnect.firebasestorage.app",
  messagingSenderId: "280278041592",
  appId: "1:280278041592:web:1e87f1ce392e6b83ed0c0d",
  measurementId: "G-FTY1TKZ2F6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export{db};