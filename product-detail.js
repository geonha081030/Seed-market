import { db, auth } from './firebase-config.js';
import { doc, getDoc } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProductDetailScreen = async (productId) => {
  window.hideAll();
  document.getElementById("product-detail-screen").style.display = "block";

  const snap = await getDoc(doc(db, "products", productId));
  const product = snap.data();

  document.getElementById("detail-title").textContent = product.title;
  document.getElementById("detail-price").textContent = product.price + "원";
  document.getElementById("detail-desc").textContent = product.description || "";

  const chatArea = document.getElementById("detail-chat-area");
  chatArea.innerHTML = "";

  // 🔥 채팅 버튼
  if (product.sellerEmail !== auth.currentUser.email && product.sellerUid) {

    const btn = document.createElement("button");
    btn.textContent = "채팅하기";

    btn.onclick = () => {

      // 🔥 핵심: UID 정렬 (절대 순서 안 바뀜)
      const ids = [auth.currentUser.uid, product.sellerUid].sort();

      // 🔥 핵심: productId 포함해서 동일 방 보장
      const roomId = ids.join("_") + "_" + productId;

      window.openChat(roomId, product.title);
    };

    chatArea.appendChild(btn);
  }
};

// 뒤로가기
document.getElementById("back-main-from-detail-btn").onclick = () => {
  window.showMainScreen();
};
