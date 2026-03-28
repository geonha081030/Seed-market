import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let chatUnsubscribe = null;

// [1] 실시간 채팅창 열기
window.openChat = (roomId, productTitle) => {
  // 모든 화면 숨기기
  const screens = ["main-screen", "product-list-screen", "product-detail-screen", "mypage-screen", "chat-list-screen"];
  screens.forEach(id => { if(document.getElementById(id)) document.getElementById(id).style.display = "none"; });
  
  document.getElementById("chat-screen").style.display = "block";
  document.getElementById("chat-title").textContent = productTitle;

  const messageList = document.getElementById("chat-messages");
  if (chatUnsubscribe) chatUnsubscribe();

  const q = query(collection(db, "chats", roomId, "messages"), orderBy("timestamp", "asc"));
  chatUnsubscribe = onSnapshot(q, (snapshot) => {
    messageList.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const isMine = data.sender === auth.currentUser.email;
      const msgDiv = document.createElement("div");
      msgDiv.style.textAlign = isMine ? "right" : "left";
      msgDiv.innerHTML = `<div style="display: inline-block; background: ${isMine ? '#ffd6e0' : '#fff'}; padding: 8px; border-radius: 10px; margin: 5px; border: 1px solid #ddd;">
        <small style="display:block; font-size:10px; color:gray;">${data.sender.split('@')[0]}</small>
        ${data.text}</div>`;
      messageList.appendChild(msgDiv);
    });
    messageList.scrollTop = messageList.scrollHeight;
  });

  document.getElementById("send-chat-btn").onclick = async () => {
    const input = document.getElementById("chat-input");
    if (!input.value.trim()) return;
    try {
      await addDoc(collection(db, "chats", roomId, "messages"), {
        text: input.value,
        sender: auth.currentUser.email,
        timestamp: serverTimestamp()
      });
      input.value = "";
    } catch (e) { alert("전송 에러: " + e.message); }
  };
};

// [2] 내 채팅 목록 불러오기
window.loadChatList = async () => {
  const container = document.getElementById("chat-rooms-container");
  container.innerHTML = "목록 불러오는 중...";
  const myUid = auth.currentUser.uid;

  const snapshot = await getDocs(collection(db, "chats"));
  container.innerHTML = "";

  let hasChat = false;
  snapshot.forEach(docSnap => {
    const roomId = docSnap.id;
    if (roomId.includes(myUid)) {
      hasChat = true;
      const div = document.createElement("div");
      div.className = "product-item";
      div.style.cursor = "pointer";
      div.innerHTML = `<strong>채팅방: ${roomId.substring(0, 15)}...</strong><br><small>클릭하여 입장</small>`;
      div.onclick = () => window.openChat(roomId, "이전 대화");
      container.appendChild(div);
    }
  });
  if (!hasChat) container.innerHTML = "<p>진행 중인 채팅이 없습니다.</p>";
};

document.getElementById("back-from-chat-btn").onclick = () => {
  if (chatUnsubscribe) chatUnsubscribe();
  document.getElementById("chat-screen").style.display = "none";
  window.showMainScreen();
};
