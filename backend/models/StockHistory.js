const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Products', required: true },
    productName: { type: String, required: true },
    action: { type: String, enum: ['order', 'restock', 'adjustment', 'deletion'], required: true },
    quantityChanged: { type: Number, required: true }, // positive for restock, negative for order/adjustment
    previousQuantity: { type: Number, required: true },
    newQuantity: { type: Number, required: true },
    reference: { type: String }, // order ID or reason for adjustment
    reason: { type: String }, // description of why stock was changed
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StockHistory', stockHistorySchema);
