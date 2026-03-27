import { db, auth } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProducts = async () => {
  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "products"));
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const itemDiv = document.createElement("div");
      itemDiv.className = "product-item";

      itemDiv.innerHTML = `
        <h4>${data.title} ${data.sold ? "(판매 완료)" : ""}</h4>
        <p>가격: ${data.price}원</p>
        <p>${data.description}</p>
        <p>판매자: ${data.sellerEmail}</p>
      `;

      if(data.sellerEmail === auth.currentUser.email && !data.sold){
        const soldBtn = document.createElement("button");
        soldBtn.textContent = "판매 완료";
        soldBtn.addEventListener("click", () => window.markAsSold(docSnap.id));
        itemDiv.appendChild(soldBtn);
      }

      listDiv.appendChild(itemDiv);
    });
  } catch (e) {
    console.error("상품 불러오기 실패:", e);
    listDiv.innerHTML = "상품을 불러오는 중 오류 발생";
  }
};
