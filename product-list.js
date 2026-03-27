// product-list.js
import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProducts = async function() {
  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "products"));
  querySnapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `
      <h4>${data.title}</h4>
      <p>가격: ${data.price}원</p>
      <p>${data.description || ""}</p>
      ${data.imageUrl ? `<img src="${data.imageUrl}" style="max-width:200px;">` : ""}
      <p>판매자: ${data.sellerEmail}</p>
    `;
    listDiv.appendChild(div);
  });
}
