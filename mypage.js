import { db, auth } from './firebase-config.js';
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let currentFilter = "all";

window.setFilter = (type) => {
  currentFilter = type;
  window.loadMyPage();
};

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

    if (product.sellerEmail !== userEmail) return;

    if (currentFilter === "selling" && product.sold) return;
    if (currentFilter === "sold" && !product.sold) return;

    const div = document.createElement("div");
    div.className = "product-card";

    if (product.sold) div.classList.add("sold");

    // 🔥 기본 보기 영역
    const contentDiv = document.createElement("div");
    contentDiv.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.price}원</p>
      <p>${product.description || ""}</p>
      ${product.sold ? `<p class="sold-text">판매 완료</p>` : ""}
    `;

    div.appendChild(contentDiv);

    // 🔥 수정 버튼
    const editBtn = document.createElement("button");
    editBtn.textContent = "수정";
    editBtn.style.backgroundColor = "#4CAF50";
    editBtn.style.color = "white";

    editBtn.onclick = () => {
      div.innerHTML = ""; // 기존 내용 제거

      const titleInput = document.createElement("input");
      titleInput.value = product.title;

      const priceInput = document.createElement("input");
      priceInput.type = "number";
      priceInput.value = product.price;

      const descInput = document.createElement("textarea");
      descInput.value = product.description || "";

      const saveBtn = document.createElement("button");
      saveBtn.textContent = "저장";
      saveBtn.className = "sold-btn";

      saveBtn.onclick = async () => {
        if (!titleInput.value || !priceInput.value) {
          alert("상품명과 가격은 필수입니다.");
          return;
        }

        const { doc, updateDoc } = await import(
          "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
        );

        await updateDoc(doc(db, "products", docSnap.id), {
          title: titleInput.value,
          price: Number(priceInput.value),
          description: descInput.value
        });

        alert("수정 완료!");
        window.loadMyPage();
        if (window.showProducts) window.showProducts();
      };

      div.appendChild(titleInput);
      div.appendChild(priceInput);
      div.appendChild(descInput);
      div.appendChild(saveBtn);
    };

    div.appendChild(editBtn);

    // 판매완료 버튼
    if (!product.sold) {
      const soldBtn = document.createElement("button");
      soldBtn.textContent = "판매 완료";
      soldBtn.className = "sold-btn";
      soldBtn.onclick = () => markAsSold(docSnap.id);
      div.appendChild(soldBtn);
    }

    // 삭제 버튼
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

// 판매완료
window.markAsSold = async (productId) => {
  try {
    const { doc, updateDoc } = await import(
      "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
    );

    await updateDoc(doc(db, "products", productId), { sold: true });

    alert("판매 완료 처리되었습니다.");
    window.loadMyPage();
    if (window.showProducts) window.showProducts();

  } catch (e) {
    alert("오류: " + e.message);
  }
};
