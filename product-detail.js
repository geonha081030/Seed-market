import { db, auth } from './firebase-config.js';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

console.log("product-detail.js 로드됨");

// 상세페이지 + 채팅
window.showProductDetailScreen = async (productId) => {

  console.log("상세페이지 이동:", productId);

  // 화면 전환
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "block";
  document.getElementById("product-detail-screen").style.display = "block";

  try {
    const productRef = doc(db, "products", productId);
    const snap = await getDoc(productRef);

    if (!snap.exists()) {
      alert("상품 없음");
      return;
    }

    const product = snap.data();

    // 상품 정보 표시
    document.getElementById("detail-title").textContent = product.title;
    document.getElementById("detail-price").textContent = product.price + "원";
    document.getElementById("detail-desc").textContent = product.description || "";

    // 🔥 1:1 채팅 ID
    const myEmail = auth.currentUser.email;
    const sellerEmail = product.sellerEmail;

    const chatId = [myEmail, sellerEmail].sort().join("_");

    const chatRef = collection(productRef, "chats", chatId, "messages");

    const chatList = document.getElementById("chat-list");
    chatList.innerHTML = "";

    // 🔥 실시간 채팅
    const q = query(chatRef, orderBy("createdAt"));
    onSnapshot(q, snapshot => {
      chatList.innerHTML = "";

      snapshot.forEach(docSnap => {
        const msg = docSnap.data();

        const div = document.createElement("div");

        if (msg.sender === myEmail) {
          div.style.textAlign = "right";
          div.innerHTML = `<b>나:</b> ${msg.text}`;
        } else {
          div.style.textAlign = "left";
          div.innerHTML = `<b>상대:</b> ${msg.text}`;
        }

        chatList.appendChild(div);
      });

      chatList.scrollTop = chatList.scrollHeight;
    });

    // 🔥 메시지 전송
    document.getElementById("chat-send-btn").onclick = async () => {
      const input = document.getElementById("chat-input");
      const text = input.value.trim();

      if (!text) return;

      await addDoc(chatRef, {
        sender: myEmail,
        text: text,
        createdAt: new Date()
      });

      input.value = "";
    };

  } catch (e) {
    console.error(e);
    alert("에러: " + e.message);
  }
};

// 뒤로가기
document.getElementById("back-main-from-detail-btn").addEventListener("click", () => {
  document.getElementById("product-detail-screen").style.display = "none";
  window.showMainScreen();
});
