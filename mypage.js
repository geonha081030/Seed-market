import { db, auth } from './firebase-config.js';
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let currentFilter = "all";

// 필터 변경
window.setFilter = (type) => {
  currentFilter = type;
  window.loadMyPage();
};

// 마이페이지 로드
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

    // 필터
    if (currentFilter === "selling" && product.sold) return;
    if (currentFilter === "sold" && !product.sold) return;

    const div = document.createElement("div");
    div.className = "product-card";

    if (product.sold) div.classList.add("sold");

    div.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.price}원</p>
      ${product.sold ? `<p class="sold-text">판매 완료</p>` : ""}
    `;

    // 판매완료 버튼
    if (!product.sold) {
      const soldBtn = document.createElement("button");
      soldBtn.textContent = "판매 완료";
      soldBtn.className = "sold-btn";
      soldBtn.onclick = () => markAsSold(docSnap.id);
      div.appendChild(soldBtn);
    }

    // 🔥 삭제 버튼
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";
    deleteBtn.style.backgroundColor = "#555";
    deleteBtn.style.color = "white";

    deleteBtn.onclick = async () => {
      if (!confirm("정말 삭제하시겠습니까?")) return;

      const { doc, deleteDoc } = await import(
        "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
      );

      await deleteDoc(doc(db, "products", docSnap.id));

      alert("삭제되었습니다.");
      window.loadMyPage();
    };

    div.appendChild(deleteBtn);

    const hr = document.createElement("hr");
    div.appendChild(hr);

    listDiv.appendChild(div);
  });
};

// 판매완료 처리
window.markAsSold = async (productId) => {
  try {
    const { doc, updateDoc } = await import(
      "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
    );

    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { sold: true });

    alert("판매 완료 처리되었습니다.");

    window.loadMyPage();
    if (window.showProducts) window.showProducts();

  } catch (e) {
    alert("오류: " + e.message);
  }
};
