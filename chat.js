import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDWRr2ex8Pxat6juTNfk42nVkxN_5QkRxg",
  authDomain: "seedmarket-2d350.firebaseapp.com",
  projectId: "seedmarket-2d350",
  storageBucket: "seedmarket-2d350.firebasestorage.app",
  messagingSenderId: "219597982647",
  appId: "1:219597982647:web:2604bef7220cd2e668b632"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentRoomId = new URLSearchParams(window.location.search).get("roomId");

onAuthStateChanged(auth, (user) => {
  if (user && currentRoomId) loadMessages(currentRoomId);
});

window.sendChatMessage = async () => {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text || !currentRoomId) return;

  await addDoc(collection(db, `chatRooms/${currentRoomId}/messages`), {
    senderId: auth.currentUser.uid,
    text,
    createdAt: new Date()
  });

  input.value = "";
};

function loadMessages(roomId) {
  const q = query(collection(db, `chatRooms/${roomId}/messages`), orderBy("createdAt"));
  const chatDiv = document.getElementById("chat");

  onSnapshot(q, (snapshot) => {
    chatDiv.innerHTML = "";
    snapshot.forEach(docSnap => {
      const m = docSnap.data();
      const me = m.senderId === auth.currentUser.uid;
      chatDiv.innerHTML += `<div>${me ? "나" : "상대"}: ${m.text}</div>`;
    });
    chatDiv.scrollTop = chatDiv.scrollHeight;
  });
}

window.backToList = () => { window.location.href = "index.html"; };
