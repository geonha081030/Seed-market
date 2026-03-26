// product.js
import { db, storage, auth, collection, addDoc, ref, uploadBytes, getDownloadURL } from './firebase-config.js';

export async function addProduct(title, price, description, file){
  if(!auth.currentUser || !auth.currentUser.emailVerified){
    alert("이메일 인증 후 이용 가능합니다.");
    return;
  }

  try{
    let imageUrl="";
    if(file){
      const storageRef = ref(storage, `seed-products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    const createdAt = new Date().toISOString();

    await addDoc(collection(db,"seed-products"),{
      title,
      price,
      description,
      imageUrl,
      sellerEmail: auth.currentUser.email,
      tradeMethod: "직거래",
      createdAt
    });

    alert("상품 등록 완료!");
  } catch(e){
    alert("상품 등록 실패: "+e.message);
  }
}
