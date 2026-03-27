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

    // 검색 필터
    if(searchInput && !product.title.toLowerCase().includes(searchInput)) return;

    const productDiv = document.createElement("div");
    productDiv.classList.add("product-card");

    // 🔥 판매 완료면 sold 클래스 추가 (핵심)
    if(product.sold){
      productDiv.classList.add("sold");
    }

    productDiv.innerHTML = `
      <h4>${product.title}</h4>
      <p>가격: ${product.price}원</p>
      <p>${product.description || ""}</p>
      <p>등록일: ${product.createdAt ? product.createdAt.toDate().toLocaleString() : ""}</p>

      ${product.sold ? `<p style="font-weight:bold;">판매 완료</p>` : ""}

      ${
        product.sellerEmail === auth.currentUser.email && !product.sold 
        ? `<button class="sold-btn" onclick="markAsSold('${docSnap.id}')">판매 완료</button>` 
        : ""
      }

      <hr>
    `;

    listDiv.appendChild(productDiv);
  });
};

// 검색 이벤트
document.getElementById("product-search").addEventListener("input", () => {
  window.showProducts();
});

// 판매 완료 처리
window.markAsSold = async (productId) => {
  try {
    const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js");
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { sold: true });

    if(window.showProducts) window.showProducts();
    alert("판매 완료 처리되었습니다.");
  } catch(e) {
    console.error(e);
    alert("판매 완료 처리 실패: " + e.message);
  }
};
