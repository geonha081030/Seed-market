import { db, auth } from './firebase-config.js';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

console.log("detail js 로드됨");

window.showProductDetailScreen = async (productId) => {

  document.getElementById("main-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "none";
  document.getElementById("product-detail-screen").style.display = "block";

  const productRef = doc(db, "products", productId);
  const snap = await getDoc(productRef);

  const product = snap.data();

  document.getElementById("detail-title").textContent = product.title;
  document.getElementById("detail-price").textContent = product.price + "원";
  document.getElementById("detail-desc").textContent = product.description || "";

  // 🔥 로그인 체크
  if (!auth.currentUser) {
    alert("로그인 안됨");
    return;
  }

  const myEmail = auth.currentUser.email;
  const sellerEmail = product.sellerEmail;

  const chatId = [myEmail, sellerEmail].sort().join("_");

  console.log("채팅방 ID:", chatId);

  const chatRef = collection(productRef, "chats", chatId, "messages");

  const chatList = document.getElementById("chat-list");
  chatList.innerHTML = "";

  // 채팅 불러오기
  const q = query(chatRef, orderBy("createdAt"));
  onSnapshot(q, snapshot => {
    chatList.innerHTML = "";

    snapshot.forEach(docSnap => {
      const msg = docSnap.data();
      const div = document.createElement("div");

      div.textContent = `${msg.sender}: ${msg.text}`;
      chatList.appendChild(div);
    });
  });

  // 🔥 버튼 다시 바인딩 (중요)
  const sendBtn = document.getElementById("chat-send-btn");
  const input = document.getElementById("chat-input");

  sendBtn.onclick = async () => {
    console.log("전송 버튼 클릭됨");

    const text = input.value.trim();

    if (!text) {
      alert("내용 없음");
      return;
    }

    try {
      await addDoc(chatRef, {
        sender: myEmail,
        text: text,
        createdAt: new Date()
      });

      console.log("전송 성공");
      input.value = "";

    } catch (e) {
      console.error("전송 실패:", e);
      alert("전송 실패: " + e.message);
    }
  };
};

// 뒤로가기
document.getElementById("back-main-from-detail-btn").addEventListener("click", () => {
  document.getElementById("product-detail-screen").style.display = "none";
  window.showMainScreen();
});
