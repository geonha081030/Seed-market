import { db } from './firebase-config.js';
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// 상품 목록
window.showProducts = async function(){
  const listContainer = document.getElementById("product-list");
  listContainer.innerHTML = "";
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.price}원</p>
      <p>${data.description || ''}</p>
      ${data.imageUrl ? `<img src="${data.imageUrl}" width="100">` : ''}
    `;
    listContainer.appendChild(div);
  });
}
