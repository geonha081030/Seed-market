// auth.js
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from './firebase-config.js';

export async function signUp(email, password){
  try{
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("회원가입 완료! 이메일 인증 후 로그인하세요.");
  } catch(e){
    alert("회원가입 오류: "+e.message);
  }
}

export async function login(email, password){
  try{
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if(userCredential.user.emailVerified){
      alert("로그인 성공!");
    } else {
      alert("이메일 인증이 필요합니다. 메일을 확인하세요.");
    }
  } catch(e){
    alert("로그인 실패: "+e.message);
  }
}

export function observeAuthState(callback){
  onAuthStateChanged(auth, callback);
}
