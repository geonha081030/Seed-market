import { db } from './firebase-config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// 상품 목록 표시
window.showProducts = async function(searchTerm="") {
  const listContainer = document.getElementById("product-list");
  listContainer.innerHTML = "";

  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(docSnap => {
      const data = docSnap.data();

      if (searchTerm && 
          !data.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !data.description.toLowerCase().includes(searchTerm.toLowerCase())
      ) return;

      const card = document.createElement("div");
      card.classList.add("product-card");

      const titleDiv = document.createElement("div");
      titleDiv.textContent = data.title;
      titleDiv.style.fontWeight = "bold";

      const priceDiv = document.createElement("div");
      priceDiv.textContent = data.price + "원";

      const descDiv = document.createElement("div");
      descDiv.textContent = data.description || "";

      const soldDiv = document.createElement("div");
      soldDiv.textContent = data.sold ? "판매 완료" : "판매 중";
      soldDiv.style.color = data.sold ? "red" : "green";

      card.appendChild(titleDiv);
      card.appendChild(priceDiv);
      card.appendChild(descDiv);
      card.appendChild(soldDiv);

      card.addEventListener("click", () => {
        window.showProductDetailScreen(
          docSnap.id,
          data.sellerEmail,
          data.title,
          data.price,
          data.description,
          data.sold || false
        );
      });

      listContainer.appendChild(card);
    });
  } catch(e){
    console.error("상품 목록 불러오기 실패:", e);
  }
};

// 검색창 연결
const searchInput = document.getElementById("product-search-input");
if(searchInput){
  searchInput.addEventListener("input", (e) => {
    const term = e.target.value.trim();
    window.showProducts(term);
  });
}
