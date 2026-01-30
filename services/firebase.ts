// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAP1-75GzIIHDuIrF_h0DFgParXELOSMkc",
    authDomain: "buddy-console.firebaseapp.com",
    projectId: "buddy-console",
    storageBucket: "buddy-console.firebasestorage.app",
    messagingSenderId: "103769218329",
    appId: "1:103769218329:web:4fbd08ed9593b1a68b3988"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
