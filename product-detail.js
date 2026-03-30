import { db, auth } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProductDetailScreen = async (productId) => {
  document.getElementById("product-list-screen").style.display = "none";
  document.getElementById("product-detail-screen").style.display = "block";

  const snap = await getDoc(doc(db, "products", productId));
  const product = snap.data();

  document.getElementById("detail-title").textContent = product.title;
  document.getElementById("detail-price").textContent = product.price.toLocaleString() + "원";
  document.getElementById("detail-desc").textContent = product.description;

  const chatArea = document.getElementById("detail-chat-area");
  chatArea.innerHTML = "";

  if (product.sellerEmail !== auth.currentUser.email) {
    const chatBtn = document.createElement("button");
    chatBtn.textContent = "판매자와 채팅하기";
    chatBtn.onclick = () => {
      if(!product.sellerUid) return alert("판매자 정보 오류");
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
