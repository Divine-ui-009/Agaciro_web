const express = require('express');
const router = express.Router();

const {
    addProduct, updateProduct, deleteProduct, getAllProducts, getProductById 
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');
const processImage = require('../middleware/imageProcessor');
const uploadProductImage = require('../middleware/uploadProductImage');

router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/', protect, uploadProductImage, processImage, addProduct );
router.put('/:id',protect, uploadProductImage, processImage, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;