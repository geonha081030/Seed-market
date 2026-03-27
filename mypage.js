import { db, auth } from './firebase-config.js';
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// 마이페이지 불러오기
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

    const div = document.createElement("div");
    div.className = "product-card";

    // 판매 완료면 흐리게
    if (product.sold) div.classList.add("sold");

    // 내용
    const title = document.createElement("h4");
    title.textContent = product.title;

    const price = document.createElement("p");
    price.textContent = product.price + "원";

    div.appendChild(title);
    div.appendChild(price);

    // 판매 완료 표시
    if (product.sold) {
      const soldText = document.createElement("p");
      soldText.textContent = "판매 완료";
      soldText.className = "sold-text";
      div.appendChild(soldText);
    }

    // 🔥 판매 완료 버튼 추가 (핵심)
    if (!product.sold) {
      const btn = document.createElement("button");
      btn.textContent = "판매 완료";
      btn.className = "sold-btn";
      btn.onclick = () => markAsSold(docSnap.id);
      div.appendChild(btn);
    }

    const hr = document.createElement("hr");
    div.appendChild(hr);

    listDiv.appendChild(div);
  });
};

// 🔥 판매 완료 처리 함수
window.markAsSold = async (productId) => {
  try {
    const { doc, updateDoc } = await import(
      "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
    );

    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { sold: true });

    alert("판매 완료 처리되었습니다.");

    // 마이페이지 다시 불러오기
    if (window.loadMyPage) window.loadMyPage();

    // 상품목록도 갱신 (있으면)
    if (window.showProducts) window.showProducts();

  } catch (e) {
    alert("오류: " + e.message);
  }
};
