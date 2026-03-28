import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let chatUnsubscribe = null;

// [1] 채팅창 열기
window.openChat = (roomId, productTitle) => {
  const screens = ["main-screen", "product-list-screen", "product-detail-screen", "mypage-screen", "chat-list-screen"];
  screens.forEach(id => { if(document.getElementById(id)) document.getElementById(id).style.display = "none"; });
  
  document.getElementById("chat-screen").style.display = "block";
  document.getElementById("chat-title").textContent = productTitle;

  const messageList = document.getElementById("chat-messages");
  if (chatUnsubscribe) chatUnsubscribe();

  // 메시지 역순 정렬 없이 일단 가져오기 (색인 에러 방지)
  const q = query(collection(db, "chats", roomId, "messages"), orderBy("timestamp", "asc"));
  chatUnsubscribe = onSnapshot(q, (snapshot) => {
    messageList.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const isMine = data.sender === auth.currentUser.email;
      const msgDiv = document.createElement("div");
      msgDiv.style.textAlign = isMine ? "right" : "left";
      msgDiv.innerHTML = `<div style="display: inline-block; background: ${isMine ? '#ffd6e0' : '#fff'}; padding: 8px; border-radius: 10px; margin: 5px; border: 1px solid #ddd; max-width: 80%; shadow: 1px 1px 2px gray;">
        <small style="display:block; font-size:10px; color:gray;">${data.sender.split('@')[0]}</small>
        ${data.text}</div>`;
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
        timestamp: serverTimestamp()
      });
      input.value = "";
    } catch (e) { alert("전송 에러: " + e.message); }
  };
};

// [2] 내 채팅 목록 불러오기 (판매자/구매자 통합)
window.loadChatList = async () => {
  const container = document.getElementById("chat-rooms-container");
  container.innerHTML = "<p>목록을 찾는 중...</p>";
  const myUid = auth.currentUser.uid;

  try {
    const snapshot = await getDocs(collection(db, "chats"));
    container.innerHTML = "";
    let found = false;

    for (const roomDoc of snapshot.docs) {
      const roomId = roomDoc.id;
      
      // 내 UID가 방 ID에 포함되어 있는지 확인
      if (roomId.includes(myUid)) {
        const parts = roomId.split("_");
        if (parts.length < 3) continue;

        const buyerUid = parts[0];
        const sellerUid = parts[1];
        const productId = parts[2];

        // 상품 정보 가져오기
        const pSnap = await getDoc(doc(db, "products", productId));
        const pData = pSnap.exists() ? pSnap.data() : { title: "삭제된 상품" };

        found = true;
        const div = document.createElement("div");
        div.className = "product-item";
        div.style.padding = "15px";
        div.style.marginBottom = "10px";
        div.style.borderLeft = (myUid === sellerUid) ? "6px solid #ffb6c1" : "6px solid #add8e6";
        
        const roleTag = (myUid === sellerUid) ? "<span style='color:red;'>[판매문의]</span>" : "<span style='color:blue;'>[구매문의]</span>";
        
        div.innerHTML = `
          <strong>${roleTag} ${pData.title}</strong><br>
          <small>상대방: ${roomId.replace(myUid, "").replace(/_/g, "").substring(0,8)}...</small>
        `;
        
        div.onclick = () => window.openChat(roomId, pData.title);
        container.appendChild(div);
      }
    }

    if (!found) {
      container.innerHTML = "<p style='padding:20px;'>진행 중인 채팅 대화가 없습니다.<br><small>(새 상품 등록 후 채팅을 보내보세요!)</small></p>";
    }
  } catch (e) {
    alert("목록 로드 에러: " + e.message);
  }
};

document.getElementById("back-from-chat-btn").onclick = () => {
  if (chatUnsubscribe) chatUnsubscribe();
  document.getElementById("chat-screen").style.display = "none";
  window.showMainScreen();
};
