import { db, auth } from './firebase-config.js';
import { 
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let chatUnsubscribe = null;

// 채팅창 열기 함수 (window 객체에 등록하여 외부에서 호출 가능하게 함)
window.openChat = (roomId, productTitle) => {
  // 화면 전환
  const screens = ["main-screen", "product-list-screen", "product-detail-screen", "mypage-screen", "product-add-screen"];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = "none";
  });
  document.getElementById("chat-screen").style.display = "block";
  document.getElementById("chat-title").textContent = productTitle;

  const messageList = document.getElementById("chat-messages");
  const sendBtn = document.getElementById("send-chat-btn");
  const chatInput = document.getElementById("chat-input");

  // 기존 리스너가 있다면 해제 (중복 방지)
  if (chatUnsubscribe) chatUnsubscribe();

  // 실시간 메시지 가져오기
  const q = query(collection(db, "chats", roomId, "messages"), orderBy("timestamp", "asc"));
  
  chatUnsubscribe = onSnapshot(q, (snapshot) => {
    messageList.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const isMine = data.sender === auth.currentUser.email;
      
      const msgDiv = document.createElement("div");
      msgDiv.style.textAlign = isMine ? "right" : "left";
      msgDiv.style.margin = "10px 0";
      
      msgDiv.innerHTML = `
        <div style="display: inline-block; background: ${isMine ? '#ffd6e0' : '#fff'}; 
                    padding: 8px 12px; border-radius: 10px; border: 1px solid #ddd; max-width: 70%;">
          <div style="font-size: 10px; color: #888;">${data.sender.split('@')[0]}</div>
          <div style="font-size: 14px;">${data.text}</div>
        </div>
      `;
      messageList.appendChild(msgDiv);
    });
    // 스크롤 하단 이동
    messageList.scrollTop = messageList.scrollHeight;
  }, (error) => {
    console.error("리스너 에러:", error);
    if(error.message.includes("permissions")) {
      alert("파이어베이스 Console에서 Rules(규칙)를 수정해야 합니다!");
    }
  });

  // 전송 버튼 클릭 이벤트
  sendBtn.onclick = async () => {
    const text = chatInput.value.trim();
    if (!text || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "chats", roomId, "messages"), {
        text: text,
        sender: auth.currentUser.email,
        timestamp: serverTimestamp()
      });
      chatInput.value = "";
    } catch (e) {
      alert("전송 에러: " + e.message);
    }
  };
};

// 뒤로가기 버튼 이벤트
const backBtn = document.getElementById("back-from-chat-btn");
if(backBtn) {
  backBtn.onclick = () => {
    if (chatUnsubscribe) chatUnsubscribe();
    document.getElementById("chat-screen").style.display = "none";
    window.showProductListScreen(); // 기존 auth.js에 정의된 함수 호출
  };
}
