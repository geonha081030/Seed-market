import { db, auth } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProductDetailScreen = async (productId) => {
  const detailScreen = document.getElementById("product-detail-screen");
  const listScreen = document.getElementById("product-list-screen");
  
  listScreen.style.display = "none";
  detailScreen.style.display = "block";

  const snap = await getDoc(doc(db, "products", productId));
  const product = snap.data();

  document.getElementById("detail-title").textContent = product.title;
  document.getElementById("detail-price").textContent = product.price.toLocaleString() + "원";
  document.getElementById("detail-desc").textContent = product.description;

  const chatArea = document.getElementById("detail-chat-area");
  chatArea.innerHTML = "";

  // 내가 올린 상품이 아닐 때만 채팅 버튼 보이기
  if (product.sellerEmail !== auth.currentUser.email) {
    const chatBtn = document.createElement("button");
    chatBtn.textContent = "판매자와 채팅하기";
    chatBtn.style.backgroundColor = "#ffd6e0";
    chatBtn.onclick = () => {
      if (!product.sellerUid) {
        alert("판매자 정보가 올바르지 않습니다.");
        return;
      }
      // UID를 정렬하여 유니크한 방 ID 생성
      const ids = [auth.currentUser.uid, product.sellerUid].sort();
      const roomId = `${ids[0]}_${ids[1]}_${productId}`;
      window.openChat(roomId, product.title);
    };
    chatArea.appendChild(chatBtn);
  }
};

document.getElementById("back-list-from-detail-btn").onclick = () => {
  document.getElementById("product-detail-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "block";
};
