import { db, auth } from './firebase-config.js';
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProducts = async () => {
  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  const search = document.getElementById("product-search").value.toLowerCase();

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(docSnap => {
    const product = docSnap.data();

    if (search && !product.title.toLowerCase().includes(search)) return;

    const div = document.createElement("div");
    div.classList.add("product-item");

    if (product.sold) {
      div.style.opacity = "0.5";
    }

    div.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.price}원</p>
      ${product.sold ? "<p>판매 완료</p>" : ""}
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

// 검색
document.getElementById("product-search").addEventListener("input", () => {
  window.showProducts();
});

// 화면 이동
document.getElementById("go-list-btn").addEventListener("click", () => {
  window.showProductListScreen();
});

document.getElementById("back-main-from-list-btn").addEventListener("click", () => {
  window.showMainScreen();
});
