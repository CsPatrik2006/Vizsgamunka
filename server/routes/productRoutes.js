const express = require('express');
const { getAllProducts, createProduct, getProductById } = require('../Controller/productController');

const router = express.Router();

router.get('/products', getAllProducts); 
router.post('/products', createProduct); 
router.get('/products/:id', getProductById); 
module.exports = router;
