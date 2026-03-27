import { db, auth } from './firebase-config.js';
import { collection, getDocs } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// 🔥 강제로 항상 실행되게
window.showProducts = async () => {
  console.log("상품 목록 불러오기 시작");

  const listDiv = document.getElementById("product-list");
  listDiv.innerHTML = "";

  const snapshot = await getDocs(collection(db, "products"));

  snapshot.forEach(docSnap => {
    const product = docSnap.data();

    console.log("상품:", product);

    const productDiv = document.createElement("div");
    productDiv.style.border = "2px solid black"; // 🔥 눈에 띄게
    productDiv.style.padding = "10px";
    productDiv.style.margin = "10px";

    // 등록일
    let dateText = "없음";
    if (product.createdAt && product.createdAt.toDate) {
      const d = product.createdAt.toDate();
      dateText = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
    }

    // 🔥 내용 강제 출력
    const title = document.createElement("h3");
    title.textContent = product.title;

    const price = document.createElement("p");
    price.textContent = product.price + "원";

    const date = document.createElement("p");
    date.textContent = "등록일: " + dateText;

    productDiv.appendChild(title);
    productDiv.appendChild(price);
    productDiv.appendChild(date);

    // 🔥 상세보기 버튼 (무조건 보이게)
    const detailBtn = document.createElement("button");
    detailBtn.textContent = "👉 상세보기";
    detailBtn.style.backgroundColor = "blue";
    detailBtn.style.color = "white";
    detailBtn.style.padding = "10px";
    detailBtn.style.marginTop = "10px";

    detailBtn.onclick = () => {
      console.log("상세보기 클릭:", docSnap.id);
      window.showProductDetailScreen(docSnap.id);
    };

    productDiv.appendChild(detailBtn);

    // 🔥 판매완료 버튼 (내 상품만)
    if (auth.currentUser && product.sellerEmail === auth.currentUser.email) {
      const soldBtn = document.createElement("button");
      soldBtn.textContent = "판매완료";
      soldBtn.style.marginLeft = "10px";

      soldBtn.onclick = async () => {
        const { doc, updateDoc } = await import(
          "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js"
        );

        await updateDoc(doc(db, "products", docSnap.id), {
          sold: true
        });

        alert("판매완료됨");
        window.showProducts();
      };

      productDiv.appendChild(soldBtn);
    }

    listDiv.appendChild(productDiv);
  });
};

// 🔥 페이지 들어가면 자동 실행
window.addEventListener("load", () => {
  console.log("페이지 로드됨 → 상품 불러오기");
  if (window.showProducts) window.showProducts();
});
