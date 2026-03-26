// -------------------- Firebase SDK --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// -------------------- Firebase 설정 --------------------
const firebaseConfig = {
  apiKey: "AIzaSyDWRr2ex8Pxat6juTNfk42nVkxN_5QkRxg",
  authDomain: "seedmarket-2d350.firebaseapp.com",
  projectId: "seedmarket-2d350",
  storageBucket: "seedmarket-2d350.firebasestorage.app",
  messagingSenderId: "219597982647",
  appId: "1:219597982647:web:2604bef7220cd2e668b632"
};

// -------------------- 초기화 --------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentRoomId = null;

// -------------------- URL에서 roomId 가져오기 --------------------
const params = new URLSearchParams(window.location.search);
currentRoomId = params.get("roomId");

// -------------------- 로그인 상태 확인 후 메시지 로딩 --------------------
onAuthStateChanged(auth, (user) => {
  if (user && currentRoomId) {
    loadMessages(currentRoomId);
  }
});

// -------------------- 메시지 보내기 --------------------
window.sendChatMessage = async () => {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text || !currentRoomId) return;

  try {
    await addDoc(collection(db, `chatRooms/${currentRoomId}/messages`), {
      senderId: auth.currentUser.uid,
      text: text,
      createdAt: new Date()
    });
    input.value = "";
  } catch (error) {
    alert("메시지 전송 오류: " + error.message);
  }
};

// -------------------- 메시지 로딩 --------------------
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

// -------------------- 뒤로가기 --------------------
window.backToList = () => {
  window.location.href = "index.html";
};
