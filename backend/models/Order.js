const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    orderItems: [orderItemSchema],
    address: { type: String, required: true },
    paymentMethod: { type: String, default: 'Mobile money'},
    totalPrice: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Cancelled'], default: 'Pending'},
    createdAt: { type: Date, default: Date.now }
},{timestamps: true});

module.exports = mongoose.model('Orders', orderSchema);
