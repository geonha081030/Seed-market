import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// 🔥 DOM 로딩 후 실행
window.addEventListener("DOMContentLoaded", () => {

  window.hideAll = function () {
    const screens = [
      "login-screen","signup-screen","main-screen",
      "product-add-screen","product-list-screen",
      "product-detail-screen","mypage-screen",
      "chat-screen","chat-list-screen"
    ];
    screens.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
  };

  window.showLoginScreen = () => { hideAll(); document.getElementById("login-screen").style.display = "block"; };
  window.showSignupScreen = () => { hideAll(); document.getElementById("signup-screen").style.display = "block"; };
  window.showMainScreen = () => { hideAll(); document.getElementById("main-screen").style.display = "block"; };
  window.showAddProductScreen = () => { hideAll(); document.getElementById("product-add-screen").style.display = "block"; };
  window.showProductListScreen = () => { hideAll(); document.getElementById("product-list-screen").style.display = "block"; if(window.showProducts) window.showProducts(); };

  // 버튼 연결
  document.getElementById("show-signup-btn").onclick = showSignupScreen;
  document.getElementById("back-to-login-btn").onclick = showLoginScreen;
  document.getElementById("go-add-btn").onclick = showAddProductScreen;
  document.getElementById("back-main-btn").onclick = showMainScreen;

  // 회원가입
  document.getElementById("signup-btn").onclick = async () => {
    try {
      const email = document.getElementById("signup-email").value;
      const password = document.getElementById("signup-password").value;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);

      alert("회원가입 완료. 이메일 인증하세요.");
      showLoginScreen();
    } catch (e) {
      alert(e.message);
    }
  };

  // 로그인
  document.getElementById("login-btn").onclick = async () => {
    try {
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        alert("이메일 인증 필요");
        await signOut(auth);
        return;
      }

      showMainScreen();
    } catch (e) {
      alert("로그인 실패: " + e.message);
    }
  };

  // 로그아웃
  document.getElementById("logout-btn").onclick = async () => {
    await signOut(auth);
    showLoginScreen();
  };

  // 상태 감지
  onAuthStateChanged(auth, (user) => {
    if (user && user.emailVerified) showMainScreen();
    else showLoginScreen();
  });

});
