import { db, auth } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProductDetailScreen = async (productId) => {
  const screens = ["main-screen", "product-list-screen", "mypage-screen"];
  screens.forEach(id => document.getElementById(id).style.display = "none");
  document.getElementById("product-detail-screen").style.display = "block";

  const ref = doc(db, "products", productId);
  const snap = await getDoc(ref);
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
      const roomId = [auth.currentUser.uid, product.sellerUid].sort().join("_") + "_" + productId;
      window.openChat(roomId, product.title, productId);
    };
    chatArea.appendChild(chatBtn);
  }
};

document.getElementById("back-main-from-detail-btn").addEventListener("click", () => {
  window.showMainScreen();
});
