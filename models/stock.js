
const db = require('../firebaseConfig');


async function decreaseProductStock(productId, quantity) {
 const productRef = db.collection('products').doc(productId);

  // Ambil data produk
  const productDoc = await productRef.get();
  if (!productDoc.exists) {
    throw new Error(`Product with ID ${productId} not found`);
  }

  const productData = productDoc.data();

  // Cek stok cukup
  if ((productData.stock || 0) < quantity) {
    throw new Error(`Not enough stock available for product ${productId}. Available: ${productData.stock}, Requested: ${quantity}`);
  }

  // Kurangi stok
  const newStock = productData.stock - quantity;

  // Update stok di Firestore
  await productRef.update({ stock: newStock });

  console.log(`Stock decreased for ${productId}. New stock: ${newStock}`);
}

module.exports = decreaseProductStock;
