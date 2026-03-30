import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let chatUnsubscribe = null;

window.openChat = (roomId, productTitle) => {
  const screens = ["main-screen", "product-list-screen", "product-detail-screen", "mypage-screen", "chat-list-screen"];
  screens.forEach(id => { if(document.getElementById(id)) document.getElementById(id).style.display = "none"; });
  
  document.getElementById("chat-screen").style.display = "block";
  document.getElementById("chat-title").textContent = productTitle || "채팅";

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
      msgDiv.innerHTML = `<div style="display: inline-block; background: ${isMine ? '#ffd6e0' : '#fff'}; padding: 8px; border-radius: 10px; margin: 5px; border: 1px solid #ddd;">${data.text}</div>`;
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

window.loadChatList = async () => {
  const container = document.getElementById("chat-rooms-container");
  container.innerHTML = "목록 확인 중...";
  const myUid = auth.currentUser.uid;

  try {
    const snapshot = await getDocs(collection(db, "chats"));
    container.innerHTML = "";
    let count = 0;

    for (const roomDoc of snapshot.docs) {
      if (roomDoc.id.includes(myUid)) {
        count++;
        const roomId = roomDoc.id;
        const productId = roomId.split("_")[2];

        const div = document.createElement("div");
        div.className = "product-item";
        div.style.padding = "15px";
        div.style.border = "1px solid #ddd";
        div.style.margin = "10px 0";
        div.innerHTML = `<strong>채팅방 (${count})</strong><br><small>클릭하여 대화 참여</small>`;
        
        div.onclick = () => window.openChat(roomId, "채팅 대화");
        container.appendChild(div);
      }
    }
    if (count === 0) container.innerHTML = "진행 중인 채팅이 없습니다. (새 상품으로 다시 시도하세요)";
  } catch (e) { alert(e.message); }
};
