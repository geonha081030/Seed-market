import { db, auth } from './firebase-config.js';
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot, updateDoc } 
  from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProductDetailScreen = async (productId) => {
  // 화면 전환
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("product-add-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "none";
  document.getElementById("product-detail-screen").style.display = "block";

  const detailTitle = document.getElementById("detail-title");
  const detailPrice = document.getElementById("detail-price");
  const detailDesc = document.getElementById("detail-desc");
  const detailSold = document.getElementById("detail-sold");
  const detailSoldBtn = document.getElementById("detail-sold-btn");

  // 상품 데이터 가져오기
  const productRef = doc(db, "products", productId);
  const productSnap = await getDoc(productRef);

  if(!productSnap.exists()){
    alert("상품을 찾을 수 없습니다.");
    return;
  }

  const product = productSnap.data();
  detailTitle.textContent = product.title;
  detailPrice.textContent = `가격: ${product.price}원`;
  detailDesc.textContent = product.description || "";
  detailSold.textContent = product.sold ? "판매 완료" : "";

  // 판매 완료 버튼 표시 여부
  if(auth.currentUser.email === product.sellerEmail && !product.sold){
    detailSoldBtn.style.display = "inline-block";
    detailSoldBtn.onclick = async () => {
      await updateDoc(productRef, { sold: true });
      detailSold.textContent = "판매 완료";
      detailSoldBtn.style.display = "none";
      alert("판매 완료 처리되었습니다.");
    }
  } else {
    detailSoldBtn.style.display = "none";
  }

  // 채팅 초기화
  const chatList = document.getElementById("chat-list");
  chatList.innerHTML = "";

  const messagesQuery = query(collection(productRef, "messages"), orderBy("createdAt"));
  onSnapshot(messagesQuery, snapshot => {
    chatList.innerHTML = "";
    snapshot.forEach(docSnap => {
      const msg = docSnap.data();
      const msgDiv = document.createElement("div");
      msgDiv.textContent = `${msg.senderEmail}: ${msg.message}`;
      chatList.appendChild(msgDiv);
    });
    chatList.scrollTop = chatList.scrollHeight;
  });

  // 메시지 전송
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send-btn");
  chatSendBtn.onclick = async () => {
    const text = chatInput.value.trim();
    if(!text) return;
    await addDoc(collection(productRef, "messages"), {
      senderEmail: auth.currentUser.email,
      message: text,
      createdAt: new Date()
    });
    chatInput.value = "";
  };
}

// 뒤로가기 버튼
document.getElementById("back-main-from-detail-btn").addEventListener("click", () => {
  document.getElementById("product-detail-screen").style.display = "none";
  window.showMainScreen();
});
