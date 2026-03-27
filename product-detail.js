import { db, auth } from './firebase-config.js';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.currentChatRef = null;

// 상세페이지
window.showProductDetailScreen = async (productId) => {

  document.getElementById("product-list-screen").style.display = "none";
  document.getElementById("product-detail-screen").style.display = "block";

  const productRef = doc(db, "products", productId);
  const snap = await getDoc(productRef);
  const product = snap.data();

  document.getElementById("detail-title").textContent = product.title;
  document.getElementById("detail-price").textContent = product.price + "원";
  document.getElementById("detail-desc").textContent = product.description || "";

  if (!auth.currentUser) {
    alert("로그인 필요");
    return;
  }

  const myEmail = auth.currentUser.email;
  const sellerEmail = product.sellerEmail;

  const chatId = [myEmail, sellerEmail].sort().join("_");

  // 🔥 전역 저장
  window.currentChatRef = collection(productRef, "chats", chatId, "messages");

  const chatList = document.getElementById("chat-list");
  chatList.innerHTML = "";

  const q = query(window.currentChatRef, orderBy("createdAt"));

  onSnapshot(q, snapshot => {
    chatList.innerHTML = "";

    snapshot.forEach(docSnap => {
      const msg = docSnap.data();
      const div = document.createElement("div");

      div.textContent = msg.sender + ": " + msg.text;
      chatList.appendChild(div);
    });
  });
};

// 🔥 전송 함수 (HTML에서 직접 호출)
window.sendMessage = async () => {

  console.log("전송 버튼 클릭됨");

  const input = document.getElementById("chat-input");
  const text = input.value.trim();

  if (!text) {
    alert("내용 없음");
    return;
  }

  if (!window.currentChatRef) {
    alert("채팅 연결 안됨");
    return;
  }

  try {
    await addDoc(window.currentChatRef, {
      sender: auth.currentUser.email,
      text: text,
      createdAt: new Date()
    });

    console.log("전송 성공");
    input.value = "";

  } catch (e) {
    console.error(e);
    alert("전송 실패: " + e.message);
  }
};

// 뒤로가기
document.getElementById("back-main-from-detail-btn").addEventListener("click", () => {
  document.getElementById("product-detail-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "block";
});
