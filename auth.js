// auth.js
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from './firebase-config.js';

// 회원가입
export async function signUp(email, password){
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("회원가입 완료! 이메일 인증 후 로그인하세요.");
  } catch(e){
    alert("회원가입 오류: " + e.message);
  }
}

// 로그인
export async function login(email, password){
  try {
    await signInWithEmailAndPassword(auth, email, password);
    // 화면 전환은 여기서 하지 않고 onAuthStateChanged에서 감시
  } catch(e){
    alert("로그인 실패: " + e.message);
  }
}

// 로그인 상태 감시 → 메인 화면으로
onAuthStateChanged(auth, user => {
  if(user && user.emailVerified){
    window.showMainScreen();
  }
});
