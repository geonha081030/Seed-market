import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let chatUnsubscribe = null;

window.openChat = (roomId, productTitle) => {
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
      msgDiv.className = `msg ${isMine ? 'mine' : 'other'}`;
      msgDiv.innerHTML = `
        <div class="bubble">
          <p>${data.text}</p>
          <small>${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : ""}</small>
        </div>
      `;
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
    } catch (e) { alert("오류: " + e.message); }
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
    snapshot.forEach((doc) => {
      if (doc.id.includes(myUid)) {
        count++;
        const div = document.createElement("div");
        div.className = "product-item";
        div.innerHTML = `<strong>채팅방 ${count}</strong><br><small>대화하려면 클릭</small>`;
        div.onclick = () => window.openChat(doc.id, "거래 대화");
        container.appendChild(div);
      }
    });
    if (count === 0) container.innerHTML = "채팅이 없습니다.";
  } catch (e) { alert(e.message); }
};

document.getElementById("back-from-chat-btn").onclick = () => {
  document.getElementById("chat-screen").style.display = "none";
  document.getElementById("main-screen").style.display = "block";
};
