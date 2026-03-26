// auth.js
import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// 로그인 함수
window.login = async function(email, password){
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
}

// 회원가입 함수
window.signUp = async function(email, password){
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("회원가입 완료! 이메일 인증 후 로그인하세요.");
  } catch(e) {
    alert("회원가입 오류: " + e.message);
  }
}

// 로그아웃
window.logout = async function(){
  try {
    await signOut(auth);
    alert("로그아웃되었습니다.");
    window.showLoginScreen();
  } catch(e){
    alert("로그아웃 실패: " + e.message);
  }
}

// 로그인 상태 감시 (페이지 새로고침 시 자동 화면 전환)
onAuthStateChanged(auth, user => {
  if(user && user.emailVerified){
    window.showMainScreen();
  } else {
    window.showLoginScreen();
  }
});
