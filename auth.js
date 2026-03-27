import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// 🔥 화면 전환 함수들
window.showLoginScreen = () => {
  hideAll();
  document.getElementById("login-screen").style.display = "block";
};

window.showSignupScreen = () => {
  hideAll();
  document.getElementById("signup-screen").style.display = "block";
};

window.showMainScreen = () => {
  hideAll();
  document.getElementById("main-screen").style.display = "block";
};

window.showAddProductScreen = () => {
  hideAll();
  document.getElementById("product-add-screen").style.display = "block";
};

window.showProductListScreen = () => {
  hideAll();
  document.getElementById("product-list-screen").style.display = "block";

  if (window.showProducts) window.showProducts();
};

window.showMyPage = () => {
  hideAll();
  document.getElementById("mypage-screen").style.display = "block";
};

// 🔥 전부 숨기기
function hideAll() {
  const screens = [
    "login-screen",
    "signup-screen",
    "main-screen",
    "product-add-screen",
    "product-list-screen",
    "product-detail-screen",
    "mypage-screen"
  ];

  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

// 회원가입
document.getElementById("signup-btn").addEventListener("click", async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(user.user);
    alert("회원가입 완료! 로그인하세요");
    showLoginScreen();
  } catch (e) {
    alert(e.message);
  }
});

// 로그인
document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const user = await signInWithEmailAndPassword(auth, email, password);

    if (!user.user.emailVerified) {
      alert("이메일 인증 필요");
      await signOut(auth);
      return;
    }

    showMainScreen();
  } catch (e) {
    alert("로그인 실패");
  }
});

// 자동 로그인
onAuthStateChanged(auth, user => {
  if (user && user.emailVerified) {
    showMainScreen();
  } else {
    showLoginScreen();
  }
});

// 로그아웃
document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  showLoginScreen();
});
