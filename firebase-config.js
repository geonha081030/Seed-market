// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWRr2ex8Pxat6juTNfk42nVkxN_5QkRxg",
  authDomain: "seedmarket-2d350.firebaseapp.com",
  projectId: "seedmarket-2d350",
  storageBucket: "seedmarket-2d350.firebasestorage.app",
  messagingSenderId: "219597982647",
  appId: "1:219597982647:web:2604bef7220cd2e668b632"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage, collection, addDoc, getDocs, query, orderBy, doc, getDoc, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, ref, uploadBytes, getDownloadURL };
