// auth.js
import { auth } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";

// 회원가입
export async function signUp(email, password){
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("회원가입 완료! 이메일 인증 후 로그인하세요.");
  } catch(e) {
    alert("회원가입 오류: " + e.message);
  }
}

// 로그인
export async function login(email, password){
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if(!userCredential.user.emailVerified){
      alert("이메일 인증이 완료되지 않았습니다. 이메일을 확인하세요.");
      await signOut(auth); // 인증 전 사용자는 로그아웃
      return;
    }
    alert("로그인 성공!");
    window.showMainScreen();
  } catch(e) {
    alert("로그인 실패: " + e.message);
  }
}

// 로그아웃
export async function logout(){
  try {
    await signOut(auth);
    alert("로그아웃되었습니다.");
    window.showLoginScreen();
  } catch(e){
    alert("로그아웃 실패: " + e.message);
  }
}

// 로그인 상태 감시 (페이지 새로고침 시도 시 자동 화면 전환)
onAuthStateChanged(auth, user => {
  if(user && user.emailVerified){
    window.showMainScreen();
  } else {
    window.showLoginScreen();
  }
});
