// product-list.js
import { db } from './firebase-config.js';
import { collection, query, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

export async function showProducts(){
  const listContainer = document.getElementById("product-list");
  listContainer.innerHTML = "";
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "product-item";
    div.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.price}원</p>
      <button onclick="window.showDetailScreen('${doc.id}')">상세보기</button>
    `;
    listContainer.appendChild(div);
  });
}

export async function showDetail(id){
  const docRef = collection(db, "products");
  const snapshot = await getDocs(docRef);
  const docSnap = snapshot.docs.find(d => d.id === id);
  return docSnap ? docSnap.data() : null;
}
