import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showMyPage = async () => {
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("mypage-screen").style.display = "block";

  const email = auth.currentUser.email;
  document.getElementById("my-email").textContent = email;

  const listDiv = document.getElementById("my-products");
  listDiv.innerHTML = "로딩 중...";

  const snapshot = await getDocs(collection(db, "products"));
  listDiv.innerHTML = "";

  snapshot.forEach(docSnap => {
    const product = docSnap.data();
    if (product.sellerEmail !== email) return;

    const div = document.createElement("div");
    div.classList.add("product-item");
    if (product.sold) div.classList.add("sold");

    div.innerHTML = `
      <h4>${product.title}</h4>
      <p>${product.price}원</p>
      ${product.sold ? `<p class="sold-text">판매 완료</p>` : ""}
    `;

    if (!product.sold) {
      const btn = document.createElement("button");
      btn.textContent = "판매완료 처리";
      btn.onclick = async () => {
        const ref = doc(db, "products", docSnap.id);
        await updateDoc(ref, { sold: true });
        window.showMyPage();
      };
      div.appendChild(btn);
    }
    listDiv.appendChild(div);
  });
};

document.getElementById("go-mypage-btn").onclick = () => window.showMyPage();
document.getElementById("back-main-from-mypage-btn").onclick = () => window.showMainScreen();

document.getElementById("go-chat-list-btn").onclick = () => {
  document.getElementById("mypage-screen").style.display = "none";
  document.getElementById("chat-list-screen").style.display = "block";
  window.loadChatList(); 
};

document.getElementById("back-mypage-from-chatlist-btn").onclick = () => {
  document.getElementById("chat-list-screen").style.display = "none";
  document.getElementById("mypage-screen").style.display = "block";
};
