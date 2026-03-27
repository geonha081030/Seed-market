import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// 상품 등록
document.getElementById("add-product-btn").addEventListener("click", async () => {
  const title = document.getElementById("product-title").value.trim();
  const price = document.getElementById("product-price").value.trim();
  const desc = document.getElementById("product-desc").value.trim();

  if (!title || !price) {
    alert("상품명과 가격은 필수입니다.");
    return;
  }

  try {
    await addDoc(collection(db, "products"), {
      title,
      price: Number(price),
      description: desc,
      sellerEmail: auth.currentUser.email,
      sold: false,
      createdAt: serverTimestamp()
    });

    alert("상품 등록 완료!");
    // ★ 상품 목록 자동 이동 제거
    window.showMainScreen();  // 등록 후 메인 화면으로 돌아가도록 변경
  } catch (e) {
    console.error("상품 등록 실패:", e);
    alert("상품 등록 실패: " + e.message);
  }
});

// 판매 완료 처리
window.markAsSold = async (productId) => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { sold: true });
    if(window.showProducts) window.showProducts();
    alert("판매 완료 처리되었습니다.");
  } catch(e) {
    console.error(e);
    alert("판매 완료 처리 실패: " + e.message);
  }
};
