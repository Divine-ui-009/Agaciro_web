const express = require('express');
const router = express.Router();

const { updateStock, getStockHistory, bulkRemoveStock } = require('../controllers/stockController');
const { protect } = require('../middleware/authMiddleware');

router.post('/update', protect, updateStock);
router.post('/bulk-remove', protect, bulkRemoveStock);
router.get('/history', protect, getStockHistory);

module.exports = router;
