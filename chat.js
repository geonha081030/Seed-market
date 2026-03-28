import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let chatUnsubscribe = null;

// [1] 채팅창 열기
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
      msgDiv.style.textAlign = isMine ? "right" : "left";
      msgDiv.innerHTML = `<div style="display: inline-block; background: ${isMine ? '#ffd6e0' : '#fff'}; padding: 8px; border-radius: 10px; margin: 5px; border: 1px solid #ddd; max-width: 80%;">
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

// [2] 내 채팅 목록 불러오기 (판매자/구매자 모두 확인 가능)
window.loadChatList = async () => {
  const container = document.getElementById("chat-rooms-container");
  container.innerHTML = "채팅 목록을 불러오는 중...";
  const myUid = auth.currentUser.uid;

  // 전체 채팅방 조회
  const snapshot = await getDocs(collection(db, "chats"));
  container.innerHTML = "";

  let foundRooms = false;

  snapshot.forEach(docSnap => {
    const roomId = docSnap.id;
    // roomId 규칙: 구매자UID_판매자UID_상품ID
    if (roomId.includes(myUid)) {
      foundRooms = true;
      const parts = roomId.split("_");
      const buyerUid = parts[0];
      const sellerUid = parts[1];
      
      const role = (myUid === sellerUid) ? "판매중인 상품 문의" : "내가 보낸 문의";
      
      const div = document.createElement("div");
      div.className = "product-item";
      div.style.cursor = "pointer";
      div.style.borderLeft = (myUid === sellerUid) ? "5px solid #ffd6e0" : "5px solid #d6f5ff";
      
      div.innerHTML = `
        <p style="margin:0;"><strong>${role}</strong></p>
        <small>방 번호: ${roomId.substring(roomId.length - 5)}</small>
      `;
      
      div.onclick = () => window.openChat(roomId, "채팅 대화");
      container.appendChild(div);
    }
  });

  if (!foundRooms) {
    container.innerHTML = "<p style='padding:20px;'>진행 중인 채팅 대화가 없습니다.</p>";
  }
};

document.getElementById("back-from-chat-btn").onclick = () => {
  if (chatUnsubscribe) chatUnsubscribe();
  document.getElementById("chat-screen").style.display = "none";
  window.showMainScreen();
};
