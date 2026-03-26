import { db, storage, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("add-product-btn");
  addBtn.addEventListener("click", async () => {
    const title = document.getElementById("product-title").value;
    const price = document.getElementById("product-price").value;
    const desc = document.getElementById("product-desc").value;
    const file = document.getElementById("product-file").files[0];

    if (!title || !price) {
      alert("상품명과 가격은 필수입니다.");
      return;
    }

    try {
      let imageUrl = "";
      if(file){
        const storageRef = ref(storage, 'products/' + Date.now() + "_" + file.name);
        const snapshot = await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(snapshot.ref);
      }

      await addDoc(collection(db, "products"), {
        title,
        price,
        description: desc,
        imageUrl,
        sellerEmail: auth.currentUser.email,
        createdAt: serverTimestamp()
      });

      alert("상품 등록 완료!");
      window.showProductListScreen();
    } catch(e){
      alert("상품 등록 실패: " + e.message);
    }
  });
});
