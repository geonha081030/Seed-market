import { db, auth } from './firebase-config.js';
import { doc, getDoc } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProductDetailScreen = async (productId) => {

  // 🔥 모든 화면 숨기기
  window.hideAll();
  document.getElementById("product-detail-screen").style.display = "block";

  try {
    // 🔥 상품 데이터 가져오기
    const snap = await getDoc(doc(db, "products", productId));

    if (!snap.exists()) {
      alert("상품을 찾을 수 없습니다.");
      return;
    }

    const product = snap.data();

    // 🔥 화면 표시
    document.getElementById("detail-title").textContent = product.title;
    document.getElementById("detail-price").textContent = product.price + "원";
    document.getElementById("detail-desc").textContent = product.description || "";

    const chatArea = document.getElementById("detail-chat-area");
    chatArea.innerHTML = "";

    // 🔥 본인 상품이면 채팅 버튼 X
    if (product.sellerUid === auth.currentUser.uid) {
      const msg = document.createElement("p");
      msg.textContent = "내 상품입니다.";
      chatArea.appendChild(msg);
      return;
    }

    // 🔥 sellerUid 없으면 채팅 불가
    if (!product.sellerUid) {
      const msg = document.createElement("p");
      msg.textContent = "이 상품은 채팅을 지원하지 않습니다.";
      chatArea.appendChild(msg);
      return;
    }

    // 🔥 채팅 버튼 생성
    const btn = document.createElement("button");
    btn.textContent = "판매자와 채팅하기";

    btn.onclick = () => {
      // 🔥 항상 동일한 roomId 생성
      const ids = [auth.currentUser.uid, product.sellerUid].sort();
      const roomId = ids.join("_") + "_" + productId;

      // 🔥 채팅 열기 (상품명 + 판매자 UID 전달)
      window.openChat(roomId, product.title, product.sellerUid);
    };

    chatArea.appendChild(btn);

  } catch (e) {
    alert("상품 불러오기 오류: " + e.message);
  }
};

// 🔥 뒤로가기 버튼
document.getElementById("back-main-from-detail-btn").onclick = () => {
  window.showMainScreen();
};
