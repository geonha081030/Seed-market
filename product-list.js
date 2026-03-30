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

    if (product.sold) div.classList.add("sold");

    div.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.price}원</p>
      ${product.sold ? `<p class="sold-text">판매 완료</p>` : ""}
    `;

    const detailBtn = document.createElement("button");
    detailBtn.textContent = "상세보기";
    detailBtn.onclick = () => {
      window.showProductDetailScreen(docSnap.id);
    };

    div.appendChild(detailBtn);
    listDiv.appendChild(div);
  });
};

// 검색
document.getElementById("product-search").addEventListener("input", () => {
  window.showProducts();
});

// 이동
document.getElementById("go-list-btn").addEventListener("click", () => {
  window.showProductListScreen();
});

document.getElementById("back-main-from-list-btn").addEventListener("click", () => {
  window.showMainScreen();
});
