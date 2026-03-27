import { db } from './firebase-config.js';
import { doc, getDoc } 
from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

window.showProductDetailScreen = async (productId) => {

  document.getElementById("main-screen").style.display = "none";
  document.getElementById("product-list-screen").style.display = "none";
  document.getElementById("product-detail-screen").style.display = "block";

  const ref = doc(db, "products", productId);
  const snap = await getDoc(ref);

  const product = snap.data();

  document.getElementById("detail-title").textContent = product.title;
  document.getElementById("detail-price").textContent = product.price + "원";
  document.getElementById("detail-desc").textContent = product.description || "";
};

document.getElementById("back-main-from-detail-btn").addEventListener("click", () => {
  document.getElementById("product-detail-screen").style.display = "none";
  window.showMainScreen();
});
