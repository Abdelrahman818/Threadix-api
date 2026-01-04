const express = require('express');
const route = express.Router();
const upload = require('../middleware/imageSaver');

const {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  matchWithTarget,
  getProductsByCategory,
  getFeatured,
} = require('../controllers/productsController.js');

const { verifyAdmin } = require('../middleware/verifyUser');
const productValidation = require('../middleware/productValidation');

// Users
route.get('/', getAllProducts);
route.get('/featured', getFeatured);
route.get('/search/:target', matchWithTarget);
route.get('/:category', getProductsByCategory);
route.get('/item/:id', getProductById);

// Admin
route.post('/', verifyAdmin, productValidation, upload.array('images', 10), addProduct);
route.patch('/:id', verifyAdmin, upload.array('images', 10), updateProduct);
route.delete('/:id', verifyAdmin, deleteProduct);

module.exports = route;
