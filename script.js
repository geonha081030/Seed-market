<script type="module">
// -------------------- Firebase SDK --------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  sendEmailVerification 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  doc,
  query, 
  orderBy, 
  onSnapshot, 
  where, 
  getDocs, 
  updateDoc, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

// -------------------- Firebase 설정 --------------------
const firebaseConfig = {
  apiKey: "AIzaSyDWRr2ex8Pxat6juTNfk42nVkxN_5QkRxg",
  authDomain: "seedmarket-2d350.firebaseapp.com",
  projectId: "seedmarket-2d350",
  storageBucket: "seedmarket-2d350.firebasestorage.app",
  messagingSenderId: "219597982647",
  appId: "1:219597982647:web:2604bef7220cd2e668b632"
};

// -------------------- 초기화 --------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let currentRoomId = null;

// -------------------- 로그인 상태 --------------------
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadItems();
  } else {
    document.getElementById("auth").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
});

// -------------------- 회원가입 --------------------
window.signUp = async () => {
  const email = val("email");
  const password = val("password");

  if (!email || !password) return alert("이메일과 비밀번호를 입력하세요");

  const user = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(user.user);

  alert("회원가입 완료! 이메일 인증 후 로그인하세요");
};

// -------------------- 로그인 --------------------
window.login = async () => {
  const email = val("email");
  const password = val("password");

  if (!email || !password) return alert("이메일과 비밀번호를 입력하세요");

  await signInWithEmailAndPassword(auth, email, password);
};

// -------------------- 로그아웃 --------------------
window.logout = async () => {
  await signOut(auth);
};

// -------------------- 상품 등록 --------------------
window.addItemWithImage = async () => {
  const title = val("title");
  const price = val("price");
  const file = document.getElementById("image").files[0];

  if (!title || !price || !file) return alert("모든 항목을 입력하세요");

  const fileRef = ref(storage, `items/${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const imageUrl = await getDownloadURL(fileRef);

  await addDoc(collection(db, "items"), {
    title,
    price: Number(price),
    imageUrl,
    sellerId: auth.currentUser.uid,
    status: "판매중",
    createdAt: serverTimestamp()
  });

  clear("title", "price", "image");
  loadItems();
};

// -------------------- 상품 목록 --------------------
function loadItems(searchText = "") {
  const q = query(collection(db, "items"), orderBy("createdAt", "desc"));

  onSnapshot(q, (snapshot) => {
    const div = document.getElementById("items");
    div.innerHTML = "";

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const id = docSnap.id;

      // 검색 필터 + 연관검색어
      if (searchText) {
        const titleLower = d.title.toLowerCase();
        const searchLower = searchText.toLowerCase();
        if (!titleLower.includes(searchLower)) return;
      }

      div.innerHTML += `
        <div>
          <img src="${d.imageUrl}" width="100">
          <div>${d.title} - ${d.price}원</div>
          <div>상태: ${d.status}</div>
          <button onclick="startChat('${id}', '${d.sellerId}')">채팅</button>
          ${d.sellerId === auth.currentUser.uid ? `<button onclick="markAsSold('${id}')">거래 완료</button>` : ""}
        </div>
      `;
    });
  });
}

// -------------------- 상품 검색 --------------------
window.searchItems = () => {
  const text = val("searchInput");
  loadItems(text);
};

// -------------------- 거래 완료 --------------------
window.markAsSold = async (itemId) => {
  await updateDoc(doc(db, "items", itemId), { status: "판매완료" });
};

// -------------------- 1:1 채팅 --------------------
window.startChat = async (itemId, sellerId) => {
  const buyerId = auth.currentUser.uid;

  const q = query(
    collection(db, "chatRooms"),
    where("itemId", "==", itemId),
    where("sellerId", "==", sellerId),
    where("buyerId", "==", buyerId)
  );

  const snap = await getDocs(q);

  if (!snap.empty) {
    currentRoomId = snap.docs[0].id;
  } else {
    const room = await addDoc(collection(db, "chatRooms"), {
      itemId,
      sellerId,
      buyerId,
      createdAt: serverTimestamp()
    });
    currentRoomId = room.id;
  }

  window.location.href = `chat.html?roomId=${currentRoomId}`;
};

// -------------------- 메시지 보내기 --------------------
window.sendChatMessage = async () => {
  const text = val("messageInput");
  if (!text || !currentRoomId) return;

  await addDoc(collection(db, `chatRooms/${currentRoomId}/messages`), {
    senderId: auth.currentUser.uid,
    text,
    createdAt: serverTimestamp()
  });

  clear("messageInput");
};

// -------------------- 메시지 로딩 --------------------
export function loadMessages(roomId) {
  currentRoomId = roomId;

  const q = query(
    collection(db, `chatRooms/${roomId}/messages`),
    orderBy("createdAt")
  );

  onSnapshot(q, (snapshot) => {
    const div = document.getElementById("chat");
    div.innerHTML = "";

    snapshot.forEach(docSnap => {
      const m = docSnap.data();
      const me = m.senderId === auth.currentUser.uid;
      div.innerHTML += `<div>${me ? "나" : "상대"}: ${m.text}</div>`;
    });

    div.scrollTop = div.scrollHeight;
  });
}

// -------------------- 유틸 --------------------
function val(id) {
  return document.getElementById(id).value;
}

function clear(...ids) {
  ids.forEach(id => document.getElementById(id).value = "");
}
</script>
