// product.js
import { db, storage, auth } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

export async function addProduct(title, price, description, file){
  let imageUrl = "";

  if(file){
    const storageRef = ref(storage, 'products/' + Date.now() + "_" + file.name);
    const snapshot = await uploadBytes(storageRef, file);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  await addDoc(collection(db, "products"), {
    title,
    price,
    description,
    imageUrl,
    sellerEmail: auth.currentUser.email,
    createdAt: serverTimestamp()
  });
}
