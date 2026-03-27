import { db, auth } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProducts = async () => {
  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  try {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);

    if(snapshot.empty){
      listDiv.innerHTML = "<p>등록된 상품이 없습니다.</p>";
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();

      const title = data.title || "(제목 없음)";
      const price = data.price != null ? data.price + "원" : "(가격 미정)";
      const desc = data.description || "(설명 없음)";
      const seller = data.sellerEmail || "(판매자 없음)";
      const sold = data.sold ? "(판매 완료)" : "";

      const itemDiv = document.createElement("div");
      itemDiv.className = "product-item";

      itemDiv.innerHTML = `
        <h4>${title} ${sold}</h4>
        <p>가격: ${price}</p>
        <p>${desc}</p>
        <p>판매자: ${seller}</p>
      `;

      if(data.sellerEmail === auth.currentUser.email && !data.sold){
        const soldBtn = document.createElement("button");
        soldBtn.textContent = "판매 완료";
        soldBtn.style.marginTop = "5px";
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
