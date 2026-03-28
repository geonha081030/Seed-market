import { db, auth } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProductDetailScreen = async (productId) => {
  const screens = ["main-screen", "product-list-screen", "mypage-screen"];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if(el) el.style.display = "none";
  });
  document.getElementById("product-detail-screen").style.display = "block";

  const snap = await getDoc(doc(db, "products", productId));
  if (!snap.exists()) return alert("삭제된 상품입니다.");
  const product = snap.data();

  document.getElementById("detail-title").textContent = product.title;
  document.getElementById("detail-price").textContent = product.price + "원";
  document.getElementById("detail-desc").textContent = product.description || "";

  const chatArea = document.getElementById("detail-chat-area");
  chatArea.innerHTML = "";

  // 내가 올린 상품이 아닐 때만 채팅하기 버튼 표시
  if (product.sellerEmail !== auth.currentUser.email) {
    const chatBtn = document.createElement("button");
    chatBtn.textContent = "판매자와 채팅하기";
    chatBtn.onclick = () => {
      if(!product.sellerUid) return alert("판매자 정보가 없는 상품입니다. 새 상품으로 테스트하세요.");
      
      // 고정 규칙: 구매자UID_판매자UID_상품ID
      const roomId = `${auth.currentUser.uid}_${product.sellerUid}_${productId}`;
      window.openChat(roomId, product.title);
    };
    chatArea.appendChild(chatBtn);
  } else {
    chatArea.innerHTML = "<p style='color:blue; font-size:12px;'>내가 등록한 상품입니다.</p>";
  }
};

document.getElementById("back-main-from-detail-btn").addEventListener("click", () => {
  window.showMainScreen();
});
