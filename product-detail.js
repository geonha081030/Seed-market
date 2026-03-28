import { db, auth } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProductDetailScreen = async (productId) => {
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "none";
  document.getElementById("product-detail-screen").style.display = "block";

  const ref = doc(db, "products", productId);
  const snap = await getDoc(ref);
  const product = snap.data();

  document.getElementById("detail-title").textContent = product.title;
  document.getElementById("detail-price").textContent = product.price + "원";
  document.getElementById("detail-desc").textContent = product.description || "";

  // 채팅 버튼 영역 초기화
  const chatArea = document.getElementById("detail-chat-area");
  chatArea.innerHTML = "";

  // 내가 올린 상품이 아닐 때만 '채팅하기' 버튼 생성
  if (product.sellerEmail !== auth.currentUser.email) {
    const chatBtn = document.createElement("button");
    chatBtn.textContent = "판매자와 채팅하기";
    chatBtn.onclick = () => {
      // 채팅방 ID 생성 (구매자_판매자_상품ID 조합으로 고유값 생성)
      const roomId = [auth.currentUser.uid, product.sellerEmail.replace(/[.@]/g, "_")].sort().join("-") + "-" + productId;
      window.openChat(roomId, product.title);
    };
    chatArea.appendChild(chatBtn);
  }
};

document.getElementById("back-main-from-detail-btn").addEventListener("click", () => {
  document.getElementById("product-detail-screen").style.display = "none";
  window.showMainScreen();
});
