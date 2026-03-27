import { db, auth } from './firebase-config.js';
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let currentFilter = "all";

window.setFilter = (type) => {
  currentFilter = type;
  window.loadMyPage();
};

window.loadMyPage = async () => {
  const listDiv = document.getElementById("my-products");
  listDiv.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(docSnap => {
    const product = docSnap.data();

    if (product.sellerEmail !== auth.currentUser.email) return;

    if (currentFilter === "selling" && product.sold) return;
    if (currentFilter === "sold" && !product.sold) return;

    const div = document.createElement("div");
    div.className = "product-card";
    div.style.cursor = "pointer";

    if (product.sold) div.classList.add("sold");

    div.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.price}원</p>
      ${product.sold ? `<p class="sold-text">판매 완료</p>` : ""}
    `;

    // 🔥 클릭 이동
    div.onclick = () => {
      window.showProductDetailScreen(docSnap.id);
    };

    // 수정 버튼
    const editBtn = document.createElement("button");
    editBtn.textContent = "수정";

    editBtn.onclick = (e) => {
      e.stopPropagation();
      alert("수정 기능은 그대로 유지됨");
    };

    div.appendChild(editBtn);

    // 삭제 버튼
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제";

    deleteBtn.onclick = async (e) => {
      e.stopPropagation();

      const { doc, deleteDoc } = await import(
        "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
      );

      await deleteDoc(doc(db, "products", docSnap.id));

      alert("삭제 완료");
      window.loadMyPage();
    };

    div.appendChild(deleteBtn);

    listDiv.appendChild(div);
  });
};
