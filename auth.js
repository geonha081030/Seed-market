// auth.js
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from './firebase-config.js';

export async function signUp(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Seed 회원가입 완료: " + userCredential.user.email);
  } catch (e) { alert("회원가입 오류: " + e.message); }
}

export async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    alert("Seed 로그인 성공: " + userCredential.user.email);
  } catch (e) { alert("로그인 실패: " + e.message); }
}

onAuthStateChanged(auth, user => {
  if(user) console.log("로그인 상태:", user.email);
  else console.log("로그아웃 상태");
});
