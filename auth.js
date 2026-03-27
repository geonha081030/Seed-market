import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// ==============================
// 화면 전환
// ==============================

window.showLoginScreen = () => {
  document.getElementById("login-screen").style.display = "block";
  document.getElementById("signup-screen").style.display = "none";
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("product-add-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "none";
  document.getElementById("mypage-screen").style.display = "none";
};

window.showSignupScreen = () => {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("signup-screen").style.display = "block";
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("product-add-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "none";
  document.getElementById("mypage-screen").style.display = "none";
};

window.showMainScreen = () => {
  document.getElementById("main-screen").style.display = "block";
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("signup-screen").style.display = "none";
  document.getElementById("product-add-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "none";
  document.getElementById("mypage-screen").style.display = "none";
};

window.showAddProductScreen = () => {
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("product-add-screen").style.display = "block";
};

window.showProductListScreen = () => {
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "block";
  if(window.showProducts) window.showProducts();
};

// 🔥 마이페이지 화면
window.showMyPageScreen = () => {
  document.getElementById("main-screen").style.display = "none";
  document.getElementById("mypage-screen").style.display = "block";

  if(window.loadMyPage) window.loadMyPage();
};

// ==============================
// 회원가입
// ==============================

document.getElementById("signup-btn").addEventListener("click", async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);

    alert("회원가입 완료! 이메일 인증 후 로그인하세요.");
    window.showLoginScreen();

  } catch (e) {
    alert("회원가입 오류: " + e.message);
  }
});

// ==============================
// 로그인
// ==============================

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
      alert("이메일 인증이 완료되지 않았습니다.");
      await signOut(auth);
      return;
    }

    window.showMainScreen();

  } catch (e) {
    alert("로그인 실패: " + e.message);
  }
});

// ==============================
// 자동 로그인
// ==============================

onAuthStateChanged(auth, user => {
  if (user && user.emailVerified) {
    window.showMainScreen();
  } else {
    window.showLoginScreen();
  }
});

// ==============================
// 로그아웃
// ==============================

document.getElementById("logout-btn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.showLoginScreen();
  } catch (e) {
    alert("로그아웃 실패: " + e.message);
  }
});

// ==============================
// 버튼 이벤트
// ==============================

document.getElementById("show-signup-btn").addEventListener("click", () => window.showSignupScreen());
document.getElementById("back-to-login-btn").addEventListener("click", () => window.showLoginScreen());
document.getElementById("go-add-btn").addEventListener("click", () => window.showAddProductScreen());
document.getElementById("go-list-btn").addEventListener("click", () => window.showProductListScreen());
document.getElementById("go-mypage-btn").addEventListener("click", () => window.showMyPageScreen());
document.getElementById("back-main-btn").addEventListener("click", () => window.showMainScreen());
document.getElementById("back-main-from-list-btn").addEventListener("click", () => window.showMainScreen());
document.getElementById("back-main-from-mypage-btn").addEventListener("click", () => window.showMainScreen());
