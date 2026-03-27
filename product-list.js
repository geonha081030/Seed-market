import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, orderBy } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProducts = async () => {
  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  const searchInput = document.getElementById("product-search").value.toLowerCase();

  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach(docSnap => {
    const product = docSnap.data();

    if (searchInput && !product.title.toLowerCase().includes(searchInput)) return;

    const productDiv = document.createElement("div");
    productDiv.className = "product-card";
    productDiv.style.cursor = "pointer";

    if (product.sold) productDiv.classList.add("sold");

    productDiv.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.price}원</p>
      ${product.sold ? `<p class="sold-text">판매 완료</p>` : ""}
    `;

    // 🔥 카드 클릭 → 상세페이지 이동
    productDiv.onclick = () => {
      window.showProductDetailScreen(docSnap.id);
    };

    // 🔥 내 상품일 경우 판매완료 버튼
    if (product.sellerEmail === auth.currentUser.email && !product.sold) {
      const btn = document.createElement("button");
      btn.textContent = "판매 완료";
      btn.className = "sold-btn";

      btn.onclick = async (e) => {
        e.stopPropagation(); // 🔥 클릭 막힘 방지

        const { doc, updateDoc } = await import(
          "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
        );

        await updateDoc(doc(db, "products", docSnap.id), { sold: true });

        alert("판매 완료 처리됨");
        window.showProducts();
      };

      productDiv.appendChild(btn);
    }

    const hr = document.createElement("hr");
    productDiv.appendChild(hr);

    listDiv.appendChild(productDiv);
  });
};

// 검색
document.getElementById("product-search").addEventListener("input", () => {
  window.showProducts();
});
