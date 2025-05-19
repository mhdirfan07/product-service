// routes/productRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createProductController,
  getAllProductsController,
  getProductController,
  updateProductController,
  deleteProductController,
  decreaseStockController
} = require('../controllers/products');

const verifyToken = require('../middleware/verifyToken');
const verifAdmin = require('../middleware/verifAdmin');
// Set up storage engine for Multer to handle image uploads
const storage = multer.memoryStorage(); // Store file in memory temporarily
const upload = multer({ storage: storage }); // Multer middleware for handling file uploads

// Route to create a product with image upload
router.post('/products', upload.single('imageUrl'),  verifyToken, verifAdmin, createProductController); // 'image' is the field name in the form

// Route to get all products
router.get('/products',verifyToken, getAllProductsController);

// Route to get a product by ID
router.get('/products/:id',verifyToken, getProductController);

// Endpoint untuk mengurangi stok produk
router.put('/products/decrease-stock', verifyToken, decreaseStockController);

// Route to update a product by ID with image upload
router.put('/products/:id', upload.single('image'), verifyToken, verifAdmin, updateProductController);

// Route to delete a product by ID
router.delete('/products/:id', verifyToken, verifAdmin, deleteProductController);

module.exports = router;
