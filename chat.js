// chat.js
import { db, collection, addDoc, query, orderBy, getDocs, auth } from './firebase-config.js';

export async function sendMessage(productId, message) {
  try {
    await addDoc(collection(db, `seed-products/${productId}/chat`), {
      sender: auth.currentUser.email,
      message,
      createdAt: new Date()
    });
  } catch(e) { alert("메시지 전송 실패: " + e.message); }
}

export async function showChat(productId) {
  const q = query(collection(db, `seed-products/${productId}/chat`), orderBy("createdAt"));
  const chatList = document.getElementById("chat-list");
  chatList.innerHTML = "";
  const snapshot = await getDocs(q);
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.textContent = `${data.sender}: ${data.message}`;
    chatList.appendChild(div);
  });
}
