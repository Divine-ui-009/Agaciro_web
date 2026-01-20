const express = require('express');
const router = express.Router();

const {
    createOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder );
router.get('/myorders', protect, getUserOrders);
router.get('/', protect, getAllOrders);
router.put('/:id/status', protect, updateOrderStatus);
router.delete('/:id', protect, deleteOrder);

module.exports = router;