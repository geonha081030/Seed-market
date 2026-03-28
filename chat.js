import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, doc, getDoc, collectionGroup, where } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let chatUnsubscribe = null;

// [1] 채팅창 열기 (기존과 동일하지만 에러 방지 코드 추가)
window.openChat = (roomId, productTitle) => {
  const screens = ["main-screen", "product-list-screen", "product-detail-screen", "mypage-screen", "chat-list-screen"];
  screens.forEach(id => { if(document.getElementById(id)) document.getElementById(id).style.display = "none"; });
  
  document.getElementById("chat-screen").style.display = "block";
  document.getElementById("chat-title").textContent = productTitle || "채팅방";

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
      msgDiv.innerHTML = `<div style="display: inline-block; background: ${isMine ? '#ffd6e0' : '#fff'}; padding: 8px; border-radius: 10px; margin: 5px; border: 1px solid #ddd; max-width: 80%;">${data.text}</div>`;
      messageList.appendChild(msgDiv);
    });
    messageList.scrollTop = messageList.scrollHeight;
  });

  document.getElementById("send-chat-btn").onclick = async () => {
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    try {
      await addDoc(collection(db, "chats", roomId, "messages"), {
        text: text,
        sender: auth.currentUser.email,
        senderUid: auth.currentUser.uid, // 검색을 위해 UID 저장 추가
        timestamp: serverTimestamp()
      });
      input.value = "";
    } catch (e) { alert("전송 에러: " + e.message); }
  };
};

// [2] 내 채팅 목록 불러오기 (매우 강력한 방식)
window.loadChatList = async () => {
  const container = document.getElementById("chat-rooms-container");
  container.innerHTML = "<p>대화 목록을 찾는 중...</p>";
  
  if (!auth.currentUser) return alert("로그인이 필요합니다.");
  const myUid = auth.currentUser.uid;

  try {
    // 모든 채팅방 문서를 다 가져옵니다.
    const snapshot = await getDocs(collection(db, "chats"));
    container.innerHTML = "";
    let foundCount = 0;

    for (const roomDoc of snapshot.docs) {
      const roomId = roomDoc.id;
      
      // 내 UID가 방 ID 문자열에 포함되어 있는지 확인 (가장 확실한 방법)
      if (roomId.indexOf(myUid) !== -1) {
        foundCount++;
        const parts = roomId.split("_");
        const productId = parts[2] || "";

        // 상품 정보 가져오기 시도
        let pTitle = "알 수 없는 상품";
        if (productId) {
          const pSnap = await getDoc(doc(db, "products", productId));
          if (pSnap.exists()) pTitle = pSnap.data().title;
        }

        const div = document.createElement("div");
        div.className = "product-item";
        div.style.padding = "15px";
        div.style.margin = "10px";
        div.style.background = "#fff";
        div.style.border = "1px solid #ddd";
        div.style.borderRadius = "8px";

        // 판매자/구매자 구분 표시
        const isSeller = (parts[1] === myUid);
        const roleText = isSeller ? "판매 중인 상품 문의" : "내가 보낸 문의";
        const color = isSeller ? "#ff4081" : "#2196f3";

        div.innerHTML = `
          <b style="color: ${color};">${roleText}</b><br>
          <span style="font-size: 1.1em;">${pTitle}</span><br>
          <small style="color: gray;">대화 입장하기 ></small>
        `;
        
        div.onclick = () => window.openChat(roomId, pTitle);
        container.appendChild(div);
      }
    }

    if (foundCount === 0) {
      container.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #666;">
          진행 중인 대화가 없습니다.<br><br>
          <small>1. 새 상품을 등록한다.<br>2. 다른 계정으로 접속해 채팅을 보낸다.<br>3. 전송이 완료된 후 확인한다.</small>
        </div>`;
    }
  } catch (e) {
    container.innerHTML = "에러 발생: " + e.message;
  }
};

document.getElementById("back-from-chat-btn").onclick = () => {
  if (chatUnsubscribe) chatUnsubscribe();
  document.getElementById("chat-screen").style.display = "none";
  window.showMainScreen();
};
