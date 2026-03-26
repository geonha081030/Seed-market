// product-list.js
import { db, collection, getDocs, query, orderBy, doc, getDoc } from './firebase-config.js';

export async function showProducts() {
  const q = query(collection(db, "seed-products"), orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const item = document.createElement("div");
    item.innerHTML = `
      <h3>${data.title}</h3>
      <p>가격: ${data.price}원</p>
      <p>거래방식: ${data.tradeMethod}</p>
      ${data.imageUrl ? `<img src="${data.imageUrl}" style="width:150px">` : ""}
      <button onclick="showDetail('${docSnap.id}')">상세보기</button>
    `;
    productList.appendChild(item);
  });
}

export async function showDetail(id) {
  const docRef = doc(db, "seed-products", id);
  const docSnap = await getDoc(docRef);
  if(docSnap.exists()){
    const data = docSnap.data();
    alert(`상품명: ${data.title}\n가격: ${data.price}\n설명: ${data.description}\n판매자: ${data.sellerEmail}`);
  }
}
