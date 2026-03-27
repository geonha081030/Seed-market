import { db, auth } from './firebase-config.js';
import { doc, collection, addDoc, query, orderBy, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let currentProductId = null;
let currentSellerEmail = null;

window.showProductDetailScreen = function(productId, sellerEmail, title, price, desc, sold){
  currentProductId = productId;
  currentSellerEmail = sellerEmail;

  document.getElementById("detail-title").textContent = title;
  document.getElementById("detail-price").textContent = price + "원";
  document.getElementById("detail-desc").textContent = desc;
  document.getElementById("detail-sold").textContent = sold ? "판매 완료" : "판매 중";

  const soldBtn = document.getElementById("detail-sold-btn");
  soldBtn.style.display = (auth.currentUser.email === sellerEmail && !sold) ? "inline-block" : "none";

  document.getElementById("main-screen").style.display = "none";
  document.getElementById("product-detail-screen").style.display = "block";
  document.getElementById("product-list-screen").style.display = "none";

  const chatList = document.getElementById("chat-list");
  chatList.innerHTML = "";

  if(currentProductId){
    const chatsRef = collection(db, "products", currentProductId, "chats");
    const q = query(chatsRef, orderBy("timestamp"));
    onSnapshot(q, snapshot => {
      chatList.innerHTML = "";
      snapshot.forEach(docSnap => {
        const msg = docSnap.data();
        const div = document.createElement("div");
        div.textContent = `${msg.senderEmail === auth.currentUser.email ? "나" : "판매자"}: ${msg.message}`;
        chatList.appendChild(div);
      });
      chatList.scrollTop = chatList.scrollHeight;
    });
  }
};

// 채팅 전송
document.getElementById("chat-send-btn").addEventListener("click", async () => {
  const input = document.getElementById("chat-input");
  const text = input.value.trim();
  if(!text || !currentProductId) return;

  try{
    const chatsRef = collection(db, "products", currentProductId, "chats");
    await addDoc(chatsRef, {
      senderEmail: auth.currentUser.email,
      message: text,
      timestamp: new Date()
    });
    input.value = "";
  } catch(e){
    console.error("채팅 전송 실패:", e);
    alert("채팅 전송 실패: " + e.message);
  }
});

// 판매 완료 처리
document.getElementById("detail-sold-btn").addEventListener("click", async () => {
  if(!currentProductId) return;
  try{
    const productRef = doc(db, "products", currentProductId);
    await updateDoc(productRef, { sold: true });
    alert("판매 완료 처리되었습니다.");
    window.showProductDetailScreen(currentProductId, currentSellerEmail,
      document.getElementById("detail-title").textContent,
      document.getElementById("detail-price").textContent.replace("원",""),
      document.getElementById("detail-desc").textContent,
      true
    );
  } catch(e){
    console.error("판매 완료 실패:", e);
    alert("판매 완료 실패: " + e.message);
  }
});

// 뒤로가기
document.getElementById("back-main-from-detail-btn").addEventListener("click", () => {
  document.getElementById("product-detail-screen").style.display = "none";
  document.getElementById("main-screen").style.display = "block";
});
