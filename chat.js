import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let chatUnsubscribe = null;

// [1] 채팅창 열기
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

// [2] 내 채팅 목록 불러오기 (진단 모드 포함)
window.loadChatList = async () => {
  const container = document.getElementById("chat-rooms-container");
  container.innerHTML = "<p>데이터 분석 중...</p>";
  
  // 로그인 체크
  if (!auth.currentUser) {
    container.innerHTML = "<p>로그인 정보가 없습니다.</p>";
    return;
  }
  
  const myUid = auth.currentUser.uid;
  console.log("내 UID:", myUid); // 아이패드에서도 작동 확인용

  try {
    const snapshot = await getDocs(collection(db, "chats"));
    container.innerHTML = `<h4>검색된 전체 방 개수: ${snapshot.size}개</h4>`; // 개수 먼저 표시
    
    let foundCount = 0;

    for (const roomDoc of snapshot.docs) {
      const roomId = roomDoc.id;
      
      // 내 UID가 방 ID에 포함되어 있는지 아주 꼼꼼하게 체크
      if (roomId.indexOf(myUid) !== -1) {
        foundCount++;
        const parts = roomId.split("_");
        const productId = parts[2] || "";

        // 상품 정보는 나중에 가져오더라도 일단 방부터 만듭니다.
        const div = document.createElement("div");
        div.className = "product-item";
        div.style.padding = "15px";
        div.style.margin = "10px 0";
        div.style.background = "#ffffff";
        div.style.border = "2px solid #ffd6e0";
        div.style.borderRadius = "10px";

        // 기본 텍스트 설정
        div.innerHTML = `
          <div id="title-${roomId}">채팅방 로딩 중...</div>
          <small style="color:gray;">방 ID: ${roomId.substring(0,10)}...</small>
        `;
        
        div.onclick = () => window.openChat(roomId, "채팅 대화");
        container.appendChild(div);

        // 상품 제목 비동기로 업데이트
        if (productId) {
          getDoc(doc(db, "products", productId)).then(pSnap => {
            if (pSnap.exists()) {
              document.getElementById(`title-${roomId}`).innerHTML = `<b>${pSnap.data().title}</b>`;
            } else {
              document.getElementById(`title-${roomId}`).innerHTML = `<b>삭제된 상품 대화</b>`;
            }
          });
        }
      }
    }

    if (foundCount === 0) {
      container.innerHTML += `
        <div style="background:#fff3f3; padding:20px; border-radius:10px;">
          <p>내 UID(${myUid.substring(0,5)}...)와 일치하는 방을 찾지 못했습니다.</p>
          <p style="font-size:12px; color:red;">방금 채팅을 보낸 게 맞나요? 콘솔의 chats 컬렉션 문서를 삭제하고 새로 보내보세요.</p>
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
