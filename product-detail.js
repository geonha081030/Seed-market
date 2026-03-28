import { db, auth } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProductDetailScreen = async (productId) => {
  const screens = ["main-screen", "product-list-screen", "mypage-screen"];
  screens.forEach(id => document.getElementById(id).style.display = "none");
  document.getElementById("product-detail-screen").style.display = "block";

  const snap = await getDoc(doc(db, "products", productId));
  const product = snap.data();

  document.getElementById("detail-title").textContent = product.title;
  document.getElementById("detail-price").textContent = product.price + "원";
  document.getElementById("detail-desc").textContent = product.description || "";

  const chatArea = document.getElementById("detail-chat-area");
  chatArea.innerHTML = "";

  if (product.sellerEmail !== auth.currentUser.email) {
    const chatBtn = document.createElement("button");
    chatBtn.textContent = "판매자와 채팅하기";
    chatBtn.onclick = () => {
      if(!product.sellerUid) return alert("판매자 정보가 없는 상품입니다. (새로 등록한 상품으로 테스트해보세요)");
      
      // 방 ID를 아주 단순하게 조합 (구매자UID_판매자UID_상품ID)
      const roomId = `${auth.currentUser.uid}_${product.sellerUid}_${productId}`;
      window.openChat(roomId, product.title, productId);
    };
    chatArea.appendChild(chatBtn);
  }
};
