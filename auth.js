import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// 🔥 전역으로 빼야 다른 파일에서도 사용 가능
window.hideAll = function () {
  const screens = [
    "login-screen", "signup-screen", "main-screen", 
    "product-add-screen", "product-list-screen", 
    "product-detail-screen", "mypage-screen", 
    "chat-screen", "chat-list-screen"
  ];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
};

// 화면 전환
window.showLoginScreen = () => { hideAll(); document.getElementById("login-screen").style.display = "block"; };
window.showSignupScreen = () => { hideAll(); document.getElementById("signup-screen").style.display = "block"; };
window.showMainScreen = () => { hideAll(); document.getElementById("main-screen").style.display = "block"; };
window.showAddProductScreen = () => { hideAll(); document.getElementById("product-add-screen").style.display = "block"; };
window.showProductListScreen = () => { 
  hideAll(); 
  document.getElementById("product-list-screen").style.display = "block";
  if (window.showProducts) window.showProducts();
};

// 버튼
document.getElementById("show-signup-btn").onclick = window.showSignupScreen;
document.getElementById("back-to-login-btn").onclick = window.showLoginScreen;
document.getElementById("go-add-btn").onclick = window.showAddProductScreen;
document.getElementById("back-main-btn").onclick = window.showMainScreen;

// 회원가입
document.getElementById("signup-btn").onclick = async () => {
  const email = signup-email.value;
  const password = signup-password.value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("회원가입 완료! 이메일 인증 후 로그인하세요.");
    showLoginScreen();
  } catch (e) {
    alert(e.message);
  }
};

// 로그인
document.getElementById("login-btn").onclick = async () => {
  const email = login-email.value;
  const password = login-password.value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      alert("이메일 인증 필요");
      await signOut(auth);
      return;
    }
    showMainScreen();
  } catch (e) {
    alert(e.message);
  }
};

// 자동 로그인
onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) showMainScreen();
  else showLoginScreen();
});

// 로그아웃
document.getElementById("logout-btn").onclick = async () => {
  await signOut(auth);
  showLoginScreen();
};
