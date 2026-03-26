// auth.js
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, onAuthStateChanged } from './firebase-config.js';

export async function signUp(email, password){
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("회원가입 완료! 이메일 인증 후 로그인하세요.");
  } catch(e){
    alert("회원가입 오류: " + e.message);
  }
}

export async function login(email, password){
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch(e){
    alert("로그인 실패: " + e.message);
  }
}

export async function logout(){
  try {
    await signOut(auth);
    alert("로그아웃되었습니다.");
    window.showLoginScreen();
  } catch(e){
    alert("로그아웃 실패: " + e.message);
  }
}

// 로그인 상태 감시 → 메인 화면 자동 전환
onAuthStateChanged(auth, user => {
  if(user && user.emailVerified){
    window.showMainScreen();
  }
});
