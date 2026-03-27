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

    if (product.sold) productDiv.classList.add("sold");

    // 🔥 등록일 변환
    let dateText = "";
    if (product.createdAt && product.createdAt.toDate) {
      const date = product.createdAt.toDate();
      dateText = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
    }

    productDiv.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.price}원</p>
      <p>${product.description || ""}</p>
      <p style="font-size:12px; color:gray;">등록일: ${dateText}</p>
      ${product.sold ? `<p class="sold-text">판매 완료</p>` : ""}
    `;

    // 🔥 상세보기 버튼 (핵심)
    const detailBtn = document.createElement("button");
    detailBtn.textContent = "상세보기";
    detailBtn.style.backgroundColor = "#2196F3";
    detailBtn.style.color = "white";

    detailBtn.onclick = () => {
      window.showProductDetailScreen(docSnap.id);
    };

    productDiv.appendChild(detailBtn);

    // 🔥 판매완료 버튼 (내 상품)
    if (product.sellerEmail === auth.currentUser.email && !product.sold) {
      const soldBtn = document.createElement("button");
      soldBtn.textContent = "판매 완료";
      soldBtn.className = "sold-btn";

      soldBtn.onclick = async () => {
        const { doc, updateDoc } = await import(
          "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
        );

        await updateDoc(doc(db, "products", docSnap.id), { sold: true });

        alert("판매 완료 처리됨");
        window.showProducts();
      };

      productDiv.appendChild(soldBtn);
    }

    const hr = document.createElement("hr");
    productDiv.appendChild(hr);

    listDiv.appendChild(productDiv);
  });
};

// 검색 이벤트
document.getElementById("product-search").addEventListener("input", () => {
  window.showProducts();
});
