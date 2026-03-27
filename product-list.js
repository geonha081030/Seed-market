import { db } from './firebase-config.js';
import { collection, getDocs, orderBy, query } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProducts = async () => {
  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);

  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>${data.title} - ${data.price}원</h4>
      <p>${data.description}</p>
      ${data.imageUrl ? `<img src="${data.imageUrl}" width="100">` : ""}
      <hr>
    `;
    listDiv.appendChild(div);
  });
};
