import { db, auth } from './firebase-config.js';
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// 마이페이지 불러오기
window.loadMyPage = async () => {
  const emailDiv = document.getElementById("my-email");
  const listDiv = document.getElementById("my-products");

  listDiv.innerHTML = "";

  if (!auth.currentUser) return;

  const userEmail = auth.currentUser.email;
  emailDiv.textContent = "이메일: " + userEmail;

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(docSnap => {
    const product = docSnap.data();

    // 내 상품만
    if (product.sellerEmail !== userEmail) return;

    const div = document.createElement("div");
    div.className = "product-card";

    // 판매 완료면 흐리게
    if (product.sold) div.classList.add("sold");

    div.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.price}원</p>
      ${product.sold ? `<p class="sold-text">판매 완료</p>` : ""}
      <hr>
    `;

    listDiv.appendChild(div);
  });
};
