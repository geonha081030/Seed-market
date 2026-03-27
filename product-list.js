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
    if (searchInput && !product.title.toLowerCase().includes(searchInput)) return;

    // 카드 생성
    const productDiv = document.createElement("div");
    productDiv.className = "product-card";

    // 판매 완료면 흐리게
    if (product.sold) {
      productDiv.classList.add("sold");
    }

    // 제목
    const title = document.createElement("h4");
    title.textContent = product.title;

    // 가격
    const price = document.createElement("p");
    price.textContent = `가격: ${product.price}원`;

    // 설명
    const desc = document.createElement("p");
    desc.textContent = product.description || "";

    // 등록일
    const date = document.createElement("p");
    date.textContent = product.createdAt
      ? "등록일: " + product.createdAt.toDate().toLocaleString()
      : "";

    productDiv.appendChild(title);
    productDiv.appendChild(price);
    productDiv.appendChild(desc);
    productDiv.appendChild(date);

    // 판매 완료 표시
    if (product.sold) {
      const soldText = document.createElement("p");
      soldText.textContent = "판매 완료";
      soldText.className = "sold-text";
      productDiv.appendChild(soldText);
    }

    // 🔥 판매 완료 버튼 (내 상품일 때만)
    if (product.sellerEmail === auth.currentUser.email && !product.sold) {
      const btn = document.createElement("button");
      btn.textContent = "판매 완료";
      btn.className = "sold-btn";
      btn.onclick = () => markAsSold(docSnap.id);
      productDiv.appendChild(btn);
    }

    // 구분선
    const hr = document.createElement("hr");
    productDiv.appendChild(hr);

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
    const { doc, updateDoc } = await import(
      "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
    );

    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { sold: true });

    alert("판매 완료 처리되었습니다.");
    window.showProducts();

  } catch (e) {
    alert("오류: " + e.message);
  }
};
