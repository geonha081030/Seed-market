import { db, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

document.getElementById("add-product-btn").onclick = async () => {
  const title = document.getElementById("product-title").value;
  const price = document.getElementById("product-price").value;
  const description = document.getElementById("product-desc").value;

  if (!auth.currentUser) return alert("로그인이 필요합니다.");
  if (!title || !price) return alert("제목과 가격을 입력해주세요.");

  try {
    await addDoc(collection(db, "products"), {
      title: title,
      price: parseInt(price),
      description: description,
      sellerEmail: auth.currentUser.email,
      sellerUid: auth.currentUser.uid, 
      sold: false,
      createdAt: serverTimestamp()
    });
    alert("상품 등록 완료!");
    window.showProductListScreen();
  } catch (e) {
    alert("등록 에러: " + e.message);
  }
};
