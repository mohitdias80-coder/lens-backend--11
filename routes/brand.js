const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { updateBrand, addProduct, getProducts, deleteProduct } = require('../controllers/brandController');

router.put('/update', auth, updateBrand);
router.post('/products', auth, addProduct);
router.get('/products', auth, getProducts);
router.delete('/products/:id', auth, deleteProduct);

module.exports = router;

