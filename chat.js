import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let unsubscribe = null;

// 채팅 열기
window.openChat = (roomId, title) => {
  window.hideAll();

  document.getElementById("chat-screen").style.display = "block";
  document.getElementById("chat-title").textContent = title;

  const box = document.getElementById("chat-messages");
  box.innerHTML = "";

  if (unsubscribe) unsubscribe();

  const q = query(collection(db, "chats", roomId, "messages"), orderBy("timestamp"));

  unsubscribe = onSnapshot(q, (snap) => {
    box.innerHTML = "";

    snap.forEach(doc => {
      const data = doc.data();
      const isMine = data.sender === auth.currentUser.email;

      const div = document.createElement("div");
      div.style.textAlign = isMine ? "right" : "left";

      div.innerHTML = `
        <div style="
          display:inline-block;
          background:${isMine ? '#ffd6e0' : '#fff'};
          padding:10px;
          border-radius:10px;
          margin:5px;
          border:1px solid #ddd;
        ">
          ${data.text}
        </div>
      `;

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

// 🔥🔥🔥 핵심 수정 부분
window.loadChatList = async () => {
  window.hideAll();
  document.getElementById("chat-list-screen").style.display = "block";

  const container = document.getElementById("chat-rooms-container");
  container.innerHTML = "로딩중...";

  const uid = auth.currentUser.uid;
  const snapshot = await getDocs(collection(db, "chats"));

  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const roomId = docSnap.id;

    // 🔥 핵심: 앞 두 UID만 비교
    const parts = roomId.split("_");

    if (parts.length < 3) return;

    const user1 = parts[0];
    const user2 = parts[1];

    if (uid !== user1 && uid !== user2) return;

    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `<strong>채팅방</strong>`;

    div.onclick = () => window.openChat(roomId, "채팅");

    container.appendChild(div);
  });

  if (!container.innerHTML) {
    container.innerHTML = "채팅 없음";
  }
};

// 뒤로가기
document.getElementById("back-from-chat-btn").onclick = () => {
  if (unsubscribe) unsubscribe();
  window.showMainScreen();
};

document.getElementById("back-mypage-from-chatlist-btn").onclick = () => {
  window.showMyPage();
};
