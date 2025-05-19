// models/productModel.js
const db = require('../firebaseConfig'); // Mengimpor instance Firestore
const admin = require('firebase-admin');
const { uploadImageToGcp, deleteImageFromGcp } = require('../utils/uploadToGcpBucket');

// Fungsi untuk menyimpan produk di koleksi global dan sub-koleksi pengguna
async function createProduct(name, description, price, category, stock, imageFile, userId) {
  try {
    if (!userId) throw new Error('Invalid userId');

    const imageUrl = await uploadImageToGcp(imageFile.buffer, imageFile.originalname);

    const productRef = db.collection('products').doc();
    const timestamp = admin.firestore.FieldValue.serverTimestamp();

    const newProduct = {
      name,
      description,
      price,
      category,
      stock: parseInt(stock),
      imageUrl,
      userId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await productRef.set(newProduct);

    const userProductRef = db.collection('users').doc(userId).collection('products').doc(productRef.id);
    await userProductRef.set(newProduct);

    return { id: productRef.id, ...newProduct };
  } catch (error) {
    throw new Error('Error creating product: ' + error.message);
  }
}

// Fungsi untuk mengambil semua produk dari sub-koleksi milik pengguna
async function getAllProducts() {
   try {
    const snapshot = await db.collection('products').get();
    if (snapshot.empty) return [];

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return products;
  } catch (error) {
    throw new Error('Error fetching products: ' + error.message);
  } 
}

// Fungsi untuk mengambil produk berdasarkan ID
async function getProductById(productId) {
  try {
    // Mengambil produk dari sub-koleksi 'products' milik pengguna
    const productRef = db.collection('products').doc(productId);
    const productDoc = await productRef.get();
    if (!productDoc.exists) {
      return null; // Mengembalikan null jika produk tidak ditemukan
    }
    return { id: productDoc.id, ...productDoc.data() };
  } catch (error) {
    throw new Error('Error fetching product: ' + error.message);
  }
}

// Update product
async function updateProduct(productId, updatedData, userId) {
  console.log('Update product:', updatedData, productId, userId);
  
  if (!userId || !productId) {
    throw new Error('userId or productId is undefined');
  }

  const productRefInUser = db.collection('users').doc(userId).collection('products').doc(productId);
  const productRefGlobal = db.collection('products').doc(productId);

  const productDocInUser = await productRefInUser.get();
  const productDocGlobal = await productRefGlobal.get();

  if (!productDocInUser.exists || !productDocGlobal.exists) {
    console.log('Product tidak ditemukan');
    return null;
  }

  const updatedPayload = { 
    ...updatedData, 
    updatedAt: admin.firestore.FieldValue.serverTimestamp() 
  };

  await productRefInUser.update(updatedPayload);
  await productRefGlobal.update(updatedPayload);

  // Mengambil data terbaru setelah update (dari salah satu collection)
  const updatedDoc = await productRefGlobal.get();

  return { id: productId, ...updatedDoc.data() };
}

// Delete product
async function deleteProduct(productId, userId) {
  try {
    const productRefInUser = db.collection('users').doc(userId).collection('products').doc(productId);
    const productRefGlobal = db.collection('products').doc(productId);

    const productDocInUser = await productRefInUser.get();
    const productDocGlobal = await productRefGlobal.get();

    if (!productDocInUser.exists || !productDocGlobal.exists) return null;

    const product = productDocInUser.data();
    const imageUrl = product.imageUrl;

    // Hapus di user sub-koleksi dan koleksi global
    await productRefInUser.delete();
    await productRefGlobal.delete();

    if (imageUrl) {
      await deleteImageFromGcp(imageUrl);
    }

    return true;
  } catch (error) {
    throw new Error('Error deleting product: ' + error.message);
  }
}


module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
