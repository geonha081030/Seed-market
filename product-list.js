import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProducts = async () => {
  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "products"));
    snapshot.forEach(doc => {
      const data = doc.data();
      const itemDiv = document.createElement("div");
      itemDiv.className = "product-item";
      itemDiv.innerHTML = `
        <h4>${data.title}</h4>
        <p>가격: ${data.price}원</p>
        <p>${data.description}</p>
        ${data.imageUrl ? `<img src="${data.imageUrl}" style="max-width:150px;">` : ""}
        <p>판매자: ${data.sellerEmail}</p>
      `;
      listDiv.appendChild(itemDiv);
    });
  } catch (e) {
    console.error(e);
    listDiv.innerHTML = "상품을 불러오는 중 오류 발생";
  }
};
