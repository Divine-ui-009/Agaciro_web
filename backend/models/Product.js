const mongoose = require('mongoose');
const { DEFAULT_PRODUCT_IMAGE } = require('../config/constants');

const productSchema = new mongoose.Schema({
    proName: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 0 },
    productImage: { 
        type: String, 
        default: DEFAULT_PRODUCT_IMAGE},
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true});

module.exports = mongoose.model('Products', productSchema);