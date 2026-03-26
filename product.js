import { db, storage, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("add-product-btn");

  addBtn.addEventListener("click", async () => {
    const title = document.getElementById("product-title").value.trim();
    const price = document.getElementById("product-price").value.trim();
    const desc = document.getElementById("product-desc").value.trim();
    const file = document.getElementById("product-file").files[0];

    if (!title || !price) {
      alert("상품명과 가격은 필수입니다.");
      return;
    }

    try {
      let imageUrl = "";
      if (file) {
        const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      // Firestore에 저장
      const docRef = await addDoc(collection(db, "products"), {
        title,
        price: Number(price),
        description: desc,
        imageUrl,
        sellerEmail: auth.currentUser.email,
        createdAt: serverTimestamp()
      });

      console.log("상품 등록 성공, ID:", docRef.id);
      alert("상품 등록 완료!");
      window.showProductListScreen(); // 등록 후 목록 화면으로 이동
    } catch (e) {
      console.error("등록 실패:", e);
      alert("상품 등록 실패: " + e.message);
    }
  });
});
