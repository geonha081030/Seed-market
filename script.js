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
  updateDoc,
  query,
  orderBy,
  onSnapshot,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyDWRr2ex8Pxat6juTNfk42nVkxN_5QkRxg",
  authDomain: "seedmarket-2d350.firebaseapp.com",
  projectId: "seedmarket-2d350",
  storageBucket: "seedmarket-2d350.firebasestorage.app",
  messagingSenderId: "219597982647",
  appId: "1:219597982647:web:2604bef7220cd2e668b632"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentRoomId = null;

// 로그인 상태 체크
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("app").style.display = "block";
    loadItems();
  } else {
    document.getElementById("auth").style.display = "block";
    document.getElementById("app").style.display = "none";
  }
});

// 회원가입
window.signUp = async () => {
  const email = val("email");
  const password = val("password");
  if (!email || !password) return alert("이메일과 비밀번호를 입력하세요");

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("회원가입 완료! 이메일 인증 후 로그인하세요.");
  } catch (error) { alert(error.message); }
};

// 로그인
window.login = async () => {
  const email = val("email");
  const password = val("password");
  if (!email || !password) return alert("이메일과 비밀번호를 입력하세요");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      alert("이메일 인증 후 로그인 가능합니다.");
      await signOut(auth);
      return;
    }
  } catch (error) { alert(error.message); }
};

// 로그아웃
window.logout = async () => { await signOut(auth); };

// 화면 전환
window.showSection = (id) => {
  document.getElementById("registerSection").style.display = "none";
  document.getElementById("listSection").style.display = "none";
  document.getElementById(id).style.display = "block";
};

// 상품 등록 (사진 없음)
window.addItem = async () => {
  const title = val("title");
  const price = val("price");
  if (!title || !price) return alert("상품명과 가격을 입력하세요");

  try {
    await addDoc(collection(db, "items"), {
      title,
      price: Number(price),
      sellerId: auth.currentUser.uid,
      status: "판매중",
      createdAt: serverTimestamp()
    });

    clear("title","price");
    document.getElementById("successPopup").style.display = "block";
    loadItems();
  } catch (error) { alert(error.message); }
};

// 팝업 닫기
window.closePopup = () => { document.getElementById("successPopup").style.display = "none"; };

// 상품 목록
function loadItems(searchText = "") {
  const q = query(collection(db, "items"), orderBy("createdAt","desc"));

  onSnapshot(q, (snapshot) => {
    const div = document.getElementById("items");
    div.innerHTML = "";

    snapshot.forEach(docSnap => {
      const d = docSnap.data();
      const id = docSnap.id;

      if (searchText && !d.title.toLowerCase().includes(searchText.toLowerCase())) return;

      div.innerHTML += `
        <div>
          <div>${d.title} - ${d.price}원</div>
          <div>상태: ${d.status}</div>
          <button onclick="startChat('${id}', '${d.sellerId}')">채팅</button>
          ${d.sellerId === auth.currentUser.uid && d.status==="판매중" ? `<button onclick="markAsSold('${id}')">거래 완료</button>` : ""}
        </div>
      `;
    });

    if (div.innerHTML === "") div.innerHTML = "<div>등록된 상품이 없습니다.</div>";
  });
}

// 검색
window.searchItems = () => { loadItems(val("searchInput")); };

// 거래 완료
window.markAsSold = async (itemId) => {
  try {
    const docRef = doc(db, "items", itemId);
    await updateDoc(docRef, { status: "거래완료" });
    alert("거래 완료 처리됨");
  } catch (error) { alert(error.message); }
};

// 1:1 채팅
window.startChat = async (itemId, sellerId) => {
  const buyerId = auth.currentUser.uid;

  const q = query(
    collection(db, "chatRooms"),
    where("itemId","==",itemId),
    where("sellerId","==",sellerId),
    where("buyerId","==",buyerId)
  );

  const snap = await getDocs(q);

  if (!snap.empty) currentRoomId = snap.docs[0].id;
  else {
    const room = await addDoc(collection(db, "chatRooms"), { itemId, sellerId, buyerId, createdAt: serverTimestamp() });
    currentRoomId = room.id;
  }

  window.location.href = `chat.html?roomId=${currentRoomId}`;
};

// 유틸
function val(id) { return document.getElementById(id).value; }
function clear(...ids) { ids.forEach(id => document.getElementById(id).value = ""); }
