// auth.js
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, onAuthStateChanged } from './firebase-config.js';

export async function signUp(email, password){
  if(!email.endsWith("@school.edu")){
    alert("학교 이메일만 가입 가능합니다!");
    return;
  }
  try{
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    alert("가입 완료! 이메일 인증 후 로그인하세요.");
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

onAuthStateChanged(auth, user=>{
  if(user){
    console.log("로그인 상태:", user.email);
  } else {
    console.log("로그아웃 상태");
  }
});
