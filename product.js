import { db, storage, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

// DOM이 완전히 로드된 후 버튼 이벤트 등록
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("add-product-btn");

  if (!addBtn) {
    console.error("등록 버튼을 찾을 수 없습니다!");
    return;
  }

  addBtn.addEventListener("click", async () => {
    console.log("등록 버튼 클릭 확인"); // 버튼 클릭 디버깅용

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

      const docRef = await addDoc(collection(db, "products"), {
        title,
        price: Number(price),
        description: desc,
        imageUrl,
        sellerEmail: auth.currentUser.email,
        createdAt: serverTimestamp()
      });

      console.log("Firestore 저장 완료, ID:", docRef.id);
      alert("상품 등록 완료!");
      if (window.showProductListScreen) window.showProductListScreen(); // 목록 화면으로 전환
    } catch (e) {
      console.error("상품 등록 실패:", e);
      alert("상품 등록 실패: " + e.message);
    }
  });
});
