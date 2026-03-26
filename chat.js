// chat.js
import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, onSnapshot, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// 채팅 전송
window.sendMessage = async function(productId, message){
  if(!auth.currentUser) return;
  await addDoc(collection(db, "products", productId, "chats"), {
    message,
    sender: auth.currentUser.email,
    timestamp: new Date()
  });
}

// 채팅 표시
window.showChat = function(productId){
  const chatContainer = document.getElementById("chat-list");
  chatContainer.innerHTML = "";
  const q = query(collection(db, "products", productId, "chats"), orderBy("timestamp"));
  onSnapshot(q, snapshot => {
    chatContainer.innerHTML = "";
    snapshot.forEach(doc => {
      const data = doc.data();
      const div = document.createElement("div");
      div.textContent = `${data.sender}: ${data.message}`;
      chatContainer.appendChild(div);
    });
  });
}
