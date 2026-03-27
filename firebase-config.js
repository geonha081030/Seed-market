import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWRr2ex8Pxat6juTNfk42nVkxN_5QkRxg",
  authDomain: "seedmarket-2d350.firebaseapp.com",
  projectId: "seedmarket-2d350",
  storageBucket: "seedmarket-2d350.firebasestorage.app",
  messagingSenderId: "219597982647",
  appId: "1:219597982647:web:2604bef7220cd2e668b632"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
