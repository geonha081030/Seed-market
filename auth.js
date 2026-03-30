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
    "product-detail-screen", "mypage-screen", "chat-list-screen", "chat-screen"
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

document.getElementById("show-signup-btn").onclick = window.showSignupScreen;
document.getElementById("back-to-login-btn").onclick = window.showLoginScreen;
document.getElementById("go-add-btn").onclick = window.showAddProductScreen;
document.getElementById("back-main-btn").onclick = window.showMainScreen;
document.getElementById("go-list-btn").onclick = window.showProductListScreen;

document.getElementById("signup-btn").onclick = async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("인증 메일을 보냈습니다. 확인 후 로그인하세요.");
    window.showLoginScreen();
  } catch (e) { alert(e.message); }
};

document.getElementById("login-btn").onclick = async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
      alert("이메일 인증을 완료해주세요.");
      await signOut(auth);
      return;
    }
    window.showMainScreen();
  } catch (e) { alert("로그인 실패: " + e.message); }
};

onAuthStateChanged(auth, (user) => {
  if (user && user.emailVerified) window.showMainScreen();
  else window.showLoginScreen();
});

document.getElementById("logout-btn").onclick = async () => {
  await signOut(auth);
  window.showLoginScreen();
};
