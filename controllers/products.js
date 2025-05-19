// controllers/productsController.js
const { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct,  } = require('../models/product'); // Import product model functions
const { uploadImageToGcp } = require('../utils/uploadToGcpBucket');
const decreaseProductStock = require('../models/stock');

async function createProductController(req, res) {
  const { name, description, price, category, stock } = req.body;
  const imageFile = req.file;
  const userId = req.user.userId;

  if (!imageFile) {
    return res.status(400).send({ message: 'Product image is required.' });
  }

  try {
    const product = await createProduct(name, description, price, category, stock, imageFile, userId);
    res.status(201).send({ message: 'Product created successfully', productId: product.id });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).send({ message: 'Server error, please try again later.' });
  }
}

// Controller function to get all products for a specific user
async function getAllProductsController(req, res) {// Get userId from JWT token

  try {
    const products = await getAllProducts(); // Get products from user's sub-collection
    if (products.length === 0) {
      return res.status(404).send({ message: 'No products found.' });
    }
    res.status(200).send(products); // Return the list of products
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).send({ message: 'Server error, please try again later.' });
  }
}

// Controller function to get a product by ID
async function getProductController(req, res) {
  const productId = req.params.id;
  const userId = req.user.userId;  // Get userId from JWT token

  try {
    const product = await getProductById(productId, userId); // Get product by ID from user's sub-collection
    if (!product) {
      return res.status(404).send({ message: 'Product not found.' });
    }
    res.status(200).send(product); // Return the product
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send({ message: 'Server error, please try again later.' });
  }
}

async function updateProductController(req, res) {
  const productId = req.params.id;
  const { name, description, price, category, stock } = req.body;
  const updatedData = {};
  const userId = req.user.userId;

  if (!productId) {
    return res.status(400).send({ message: 'productId is missing' });
  }

  if (name) updatedData.name = name;
  if (description) updatedData.description = description;
  if (price) updatedData.price = price;
  if (category) updatedData.category = category;
  if (stock) updatedData.stock = stock;

  if (req.file) {
    updatedData.imageUrl = await uploadImageToGcp(req.file.buffer, req.file.originalname);
  }

  if (Object.keys(updatedData).length === 0) {
    return res.status(400).send({ message: 'At least one field is required to update.' });
  }

  try {
    const updatedProduct = await updateProduct(productId, updatedData, userId);
    if (!updatedProduct) {
      return res.status(404).send({ message: 'Product not found.' });
    }
    res.status(200).send({ message: 'Product updated successfully', updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send({ message: 'Server error, please try again later.' });
  }
}

async function deleteProductController(req, res) {
  const productId = req.params.id;
  const userId = req.user.userId;

  if (!productId) {
    return res.status(400).send({ message: 'productId is missing' });
  }

  try {
    const result = await deleteProduct(productId, userId);
    if (!result) {
      return res.status(404).send({ message: 'Product not found.' });
    }
    res.status(200).send({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).send({ message: 'Server error, please try again later.' });
  }
}



// Endpoint untuk mengurangi stok produk
async function decreaseStockController(req, res) {
  const { productId, quantity } = req.body;
  console.log(productId, quantity);
  
  try {
    // Mengurangi stok produk di Firestore
    await decreaseProductStock(productId, quantity);
    res.status(200).json({ message: 'Stock decreased successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(400).json({ message: error.message });
  }
}


module.exports = {
  createProductController,
  getAllProductsController,
  getProductController,
  updateProductController,
  deleteProductController,
  decreaseStockController
};