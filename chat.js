import { db, auth } from './firebase-config.js';
import { 
  collection, addDoc, query, orderBy, onSnapshot, 
  serverTimestamp, getDocs, doc, setDoc 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let unsubscribe = null;

// 🔥 채팅 열기
window.openChat = async (roomId, title, sellerUid) => {
  window.hideAll();

  document.getElementById("chat-screen").style.display = "block";
  document.getElementById("chat-title").textContent = title;

  const box = document.getElementById("chat-messages");
  box.innerHTML = "";

  // 🔥 핵심: 채팅방에 참여자 저장
  await setDoc(doc(db, "chats", roomId), {
    participants: [auth.currentUser.uid, sellerUid],
    updatedAt: serverTimestamp()
  }, { merge: true });

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

// 🔥 채팅 목록 (완전 정확)
window.loadChatList = async () => {
  window.hideAll();
  document.getElementById("chat-list-screen").style.display = "block";

  const container = document.getElementById("chat-rooms-container");
  container.innerHTML = "로딩중...";

  const uid = auth.currentUser.uid;

  const snapshot = await getDocs(collection(db, "chats"));

  container.innerHTML = "";

  snapshot.forEach(docSnap => {
    const data = docSnap.data();

    // 🔥 핵심: participants로 필터
    if (!data.participants || !data.participants.includes(uid)) return;

    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `<strong>채팅방</strong>`;

    div.onclick = () => window.openChat(docSnap.id, "채팅", data.participants[0]);

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
