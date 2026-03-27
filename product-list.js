import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProducts = async function() {
  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const itemDiv = document.createElement("div");
      itemDiv.className = "product-item";
      itemDiv.innerHTML = `
        <h4>${data.title}</h4>
        <p>가격: ${data.price}원</p>
        <p>${data.description}</p>
        ${data.imageUrl ? `<img src="${data.imageUrl}" width="100">` : ''}
      `;
      listDiv.appendChild(itemDiv);
    });
  } catch (e) {
    console.error("상품 목록 가져오기 실패:", e);
    listDiv.innerHTML = "상품을 가져오는데 실패했습니다.";
  }
};
