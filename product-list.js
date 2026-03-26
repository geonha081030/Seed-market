// product-list.js
import { db, collection, getDocs, query, orderBy, doc, getDoc } from './firebase-config.js';

export async function showProducts(){
  const q = query(collection(db, "seed-products"), orderBy("createdAt", "desc"));
  const productList = document.getElementById("product-list");
  productList.innerHTML="";
  const snapshot = await getDocs(q);
  snapshot.forEach(docSnap=>{
    const data = docSnap.data();
    const div = document.createElement("div");
    div.innerHTML=`
      <h3>${data.title}</h3>
      <p>가격: ${data.price}원</p>
      ${data.imageUrl ? `<img src="${data.imageUrl}" style="width:150px">` : ""}
      <button onclick="showDetailScreen('${docSnap.id}')">상세보기</button>
    `;
    productList.appendChild(div);
  });
}

export async function showDetail(id){
  const docRef = doc(db,"seed-products",id);
  const docSnap = await getDoc(docRef);
  if(docSnap.exists()) return docSnap.data();
  return {};
}
