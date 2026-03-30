import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let unsubscribe = null;

// 채팅 열기
window.openChat = (roomId, title) => {
  hideAll();
  document.getElementById("chat-screen").style.display = "block";
  document.getElementById("chat-title").textContent = title;

  const box = document.getElementById("chat-messages");
  box.innerHTML = "";

  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "chats", roomId, "messages"), orderBy("timestamp"));

  unsubscribe = onSnapshot(q, snap => {
    box.innerHTML = "";
    snap.forEach(doc => {
      const data = doc.data();
      const isMine = data.sender === auth.currentUser.email;

      const div = document.createElement("div");
      div.className = isMine ? "msg mine" : "msg other";
      div.innerHTML = `<div class="bubble"><p>${data.text}</p></div>`;
      box.appendChild(div);
    });
    box.scrollTop = box.scrollHeight;
  });

  document.getElementById("send-chat-btn").onclick = async () => {
    const input = document.getElementById("chat-input");
    if (!input.value.trim()) return;

    await addDoc(collection(db, "chats", roomId, "messages"), {
      text: input.value,
      sender: auth.currentUser.email,
      timestamp: serverTimestamp()
    });

    input.value = "";
  };
};

// 채팅 목록
window.loadChatList = async () => {
  hideAll();
  document.getElementById("chat-list-screen").style.display = "block";

  const container = document.getElementById("chat-rooms-container");
  container.innerHTML = "로딩중...";

  const uid = auth.currentUser.uid;
  const snapshot = await getDocs(collection(db, "chats"));

  container.innerHTML = "";

  snapshot.forEach(doc => {
    if (!doc.id.split("_").includes(uid)) return;

    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `<strong>채팅방</strong>`;

    div.onclick = () => openChat(doc.id, "채팅");

    container.appendChild(div);
  });

  if (!container.innerHTML) {
    container.innerHTML = "채팅 없음";
  }
};

// 뒤로가기
document.getElementById("back-from-chat-btn").onclick = () => {
  if (unsubscribe) unsubscribe();
  showMainScreen();
};

document.getElementById("back-mypage-from-chatlist-btn").onclick = () => {
  showMyPage();
};
