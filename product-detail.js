import { db, auth } from './firebase-config.js';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

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

  // 🔥 1:1 채팅 ID 생성
  const myEmail = auth.currentUser.email;
  const sellerEmail = product.sellerEmail;

  const chatId = [myEmail, sellerEmail].sort().join("_");

  const chatRef = collection(productRef, "chats", chatId, "messages");

  const chatList = document.getElementById("chat-list");
  chatList.innerHTML = "";

  // 실시간 채팅
  const q = query(chatRef, orderBy("createdAt"));
  onSnapshot(q, snapshot => {
    chatList.innerHTML = "";

    snapshot.forEach(docSnap => {
      const msg = docSnap.data();

      const div = document.createElement("div");

      // 내 메시지 / 상대 메시지 구분
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

  // 메시지 보내기
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
};
