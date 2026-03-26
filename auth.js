// auth.js
import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// 화면 전환 함수
window.showLoginScreen = function(){
  document.getElementById("login-screen").style.display = "block";
  document.getElementById("signup-screen").style.display = "none";
  document.getElementById("main-screen").style.display = "none";
}

window.showSignupScreen = function(){
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("signup-screen").style.display = "block";
  document.getElementById("main-screen").style.display = "none";
}

window.showMainScreen = function(){
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("signup-screen").style.display = "none";
  document.getElementById("main-screen").style.display = "block";
  window.showProducts(); // 상품 목록 불러오기
}

// 회원가입
const signupBtn = document.getElementById("signup-btn");
signupBtn.addEventListener("click", async () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("회원가입 완료! 이메일 인증 후 로그인하세요.");
    window.showLoginScreen();
  } catch(e) {
    alert("회원가입 오류: " + e.message);
  }
});

// 로그인
const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", async () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if(!userCredential.user.emailVerified){
      alert("이메일 인증이 완료되지 않았습니다.");
      await signOut(auth);
      return;
    }
    alert("로그인 성공!");
    window.showMainScreen();
  } catch(e) {
    alert("로그인 실패: " + e.message);
  }
});

// 로그인 상태 감시
onAuthStateChanged(auth, user => {
  if(user && user.emailVerified){
    window.showMainScreen();
  } else {
    window.showLoginScreen();
  }
});

// 로그아웃
const logoutBtn = document.getElementById("logout-btn");
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("로그아웃되었습니다.");
    window.showLoginScreen();
  } catch(e){
    alert("로그아웃 실패: " + e.message);
  }
});

// 회원가입 화면 이동
const showSignupBtn = document.getElementById("show-signup-btn");
showSignupBtn.addEventListener("click", () => window.showSignupScreen());

// 로그인 화면 이동
const backToLoginBtn = document.getElementById("back-to-login-btn");
backToLoginBtn.addEventListener("click", () => window.showLoginScreen());
