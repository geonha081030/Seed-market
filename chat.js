import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let chatUnsubscribe = null;

window.openChat = (roomId, productTitle, productId) => {
  // 1. 화면 전환
  const screens = ["product-detail-screen", "product-list-screen", "main-screen"];
  screens.forEach(id => { if(document.getElementById(id)) document.getElementById(id).style.display = "none"; });
  document.getElementById("chat-screen").style.display = "block";
  document.getElementById("chat-title").textContent = productTitle;

  const messageList = document.getElementById("chat-messages");
  const sendBtn = document.getElementById("send-chat-btn");
  const chatInput = document.getElementById("chat-input");

  // 2. 실시간 리스너 연결
  if (chatUnsubscribe) chatUnsubscribe();
  const q = query(collection(db, "chats", roomId, "messages"), orderBy("timestamp", "asc"));
  
  chatUnsubscribe = onSnapshot(q, (snapshot) => {
    messageList.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const isMine = data.sender === auth.currentUser.email;
      const msgDiv = document.createElement("div");
      msgDiv.style.textAlign = isMine ? "right" : "left";
      msgDiv.innerHTML = `
        <div style="display: inline-block; background: ${isMine ? '#ffd6e0' : '#fff'}; padding: 10px; border-radius: 10px; margin: 5px; border: 1px solid #eee;">
          <p style="margin:0; font-size: 14px;">${data.text}</p>
        </div>
      `;
      messageList.appendChild(msgDiv);
    });
    messageList.scrollTop = messageList.scrollHeight;
  }, (error) => {
    alert("데이터 읽기 오류: " + error.message);
  });

  // 3. 전송 버튼 이벤트 (기존 이벤트 제거 후 새로 할당)
  sendBtn.onclick = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    try {
      console.log("전송 시도 중..."); // 로그 확인용
      await addDoc(collection(db, "chats", roomId, "messages"), {
        text: text,
        sender: auth.currentUser.email,
        timestamp: serverTimestamp()
      });
      chatInput.value = "";
      console.log("전송 완료");
    } catch (e) {
      alert("전송 실패: " + e.message);
    }
  };
};

// 뒤로가기 버튼
document.getElementById("back-from-chat-btn").onclick = () => {
  if (chatUnsubscribe) chatUnsubscribe();
  document.getElementById("chat-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "block";
};
