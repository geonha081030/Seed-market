import { db, auth } from './firebase-config.js';
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProducts = async () => {
  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(docSnap => {
    const product = docSnap.data();

    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "10px";
    div.style.margin = "10px";

    div.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.price}원</p>
    `;

    const btn = document.createElement("button");
    btn.textContent = "상세보기";
    btn.onclick = () => {
      window.showProductDetailScreen(docSnap.id);
    };

    div.appendChild(btn);

    listDiv.appendChild(div);
  });
};

// 목록 버튼 연결
document.getElementById("go-list-btn").addEventListener("click", () => {
  window.showProductListScreen();
});

// 뒤로가기
document.getElementById("back-main-from-list-btn").addEventListener("click", () => {
  window.showMainScreen();
});
