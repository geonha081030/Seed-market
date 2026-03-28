import { db, auth } from './firebase-config.js';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

let chatUnsubscribe = null;
let currentProductId = null;

window.openChat = (roomId, productTitle, productId) => {
  currentProductId = productId;
  document.getElementById("product-detail-screen").style.display = "none";
  document.getElementById("chat-screen").style.display = "block";
  document.getElementById("chat-title").textContent = `[문의] ${productTitle}`;

  const messageList = document.getElementById("chat-messages");
  if (chatUnsubscribe) chatUnsubscribe();

  const q = query(collection(db, "chats", roomId, "messages"), orderBy("timestamp", "asc"));
  chatUnsubscribe = onSnapshot(q, (snapshot) => {
    messageList.innerHTML = "";
    snapshot.forEach((doc) => {
      const data = doc.data();
      const isMine = data.sender === auth.currentUser.email;
      const msgDiv = document.createElement("div");
      msgDiv.className = isMine ? "msg mine" : "msg other";
      msgDiv.innerHTML = `<div class="bubble"><small>${data.sender.split('@')[0]}</small><p>${data.text}</p></div>`;
      messageList.appendChild(msgDiv);
    });
    messageList.scrollTop = messageList.scrollHeight;
  });

  document.getElementById("send-chat-btn").onclick = async () => {
    const input = document.getElementById("chat-input");
    if (!input.value.trim()) return;
    await addDoc(collection(db, "chats", roomId, "messages"), {
      text: input.value,
      sender: auth.currentUser.email,
      timestamp: serverTimestamp()
    });
    input.value = "";
  };
};

document.getElementById("back-from-chat-btn").onclick = () => {
  if (chatUnsubscribe) chatUnsubscribe();
  document.getElementById("chat-screen").style.display = "none";
  window.showProductDetailScreen(currentProductId);
};
