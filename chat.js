// chat.js
import { db, auth, addDoc, collection, query, orderBy, getDocs } from './firebase-config.js';

export async function sendMessage(productId, message){
  if(!auth.currentUser || !auth.currentUser.emailVerified){
    alert("이메일 인증 후 이용 가능합니다.");
    return;
  }
  await addDoc(collection(db, `seed-products/${productId}/chat`), {
    sender: auth.currentUser.email,
    message,
    createdAt: new Date()
  });
}

export async function showChat(productId){
  const chatList = document.getElementById("chat-list");
  chatList.innerHTML="";
  const q = query(collection(db, `seed-products/${productId}/chat`), orderBy("createdAt"));
  const snapshot = await getDocs(q);
  snapshot.forEach(doc=>{
    const data = doc.data();
    const div = document.createElement("div");
    div.textContent=`${data.sender}: ${data.message}`;
    chatList.appendChild(div);
  });
}
