import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

function hideAll() {
  const screens = [
    "login-screen", "signup-screen", "main-screen", 
    "product-add-screen", "product-list-screen", 
    "product-detail-screen", "mypage-screen", "chat-screen"
  ];
  screens.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
}

window.showLoginScreen = () => { hideAll(); document.getElementById("login-screen").style.display = "block"; };
window.showSignupScreen = () => { hideAll(); document.getElementById("signup-screen").style.display = "block"; };
window.showMainScreen = () => { hideAll(); document.getElementById("main-screen").style.display = "block"; };
window.showAddProductScreen = () => { hideAll(); document.getElementById("product-add-screen").style.display = "block"; };
window.showProductListScreen = () => { 
  hideAll(); 
  document.getElementById("product-list-screen").style.display = "block";
  if (window.showProducts) window.showProducts();
};

document.getElementById("show-signup-btn").addEventListener("click", window.showSignupScreen);
document.getElementById("back-to-login-btn").addEventListener("click", window.showLoginScreen);
document.getElementById("go-add-btn").addEventListener("click", window.showAddProductScreen);
document.getElementById("back-main-btn").addEventListener("click", window.showMainScreen);

document.getElementById("signup-btn").addEventListener("click", async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("회원가입 완료! 이메일 인증 후 로그인하세요.");
    window.showLoginScreen();
  } catch (e) { alert("회원가입 오류: " + e.message); }
});

document.getElementById("login-btn").addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      alert("이메일 인증이 필요합니다.");
      await signOut(auth);
      return;
    }
    window.showMainScreen();
  } catch (e) { alert("로그인 실패: " + e.message); }
});

onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) window.showMainScreen();
  else window.showLoginScreen();
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await signOut(auth);
  window.showLoginScreen();
});
