import { db, storage, auth } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

document.getElementById("add-product-btn").addEventListener("click", async () => {
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
      // Storage 업로드 시 권한과 파일 유효성 확인
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(snapshot.ref);
    }

    await addDoc(collection(db, "products"), {
      title,
      price: Number(price),
      description: desc,
      imageUrl,
      sellerEmail: auth.currentUser.email
    });

    alert("상품 등록 완료!");
    // 상품 목록 화면으로 이동만 하고, 목록 표시 함수는 여기서 호출하지 않음
    window.showProductListScreen();
  } catch (e) {
    console.error("상품 등록 실패:", e);
    alert("상품 등록 실패: " + e.message);
  }
});
