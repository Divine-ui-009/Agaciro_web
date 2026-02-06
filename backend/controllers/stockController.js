const Product = require('../models/Product');
const StockHistory = require('../models/StockHistory');

exports.updateStock = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can update stock' });
        }

        const { productId, operation, quantity, reason, buyerName } = req.body;

        if (!productId || !operation || quantity === undefined) {
            return res.status(400).json({ message: 'Product ID, operation type, and quantity are required' });
        }

        if (!['add', 'reduce'].includes(operation)) {
            return res.status(400).json({ message: 'Operation must be either "add" or "reduce"' });
        }

        if (quantity < 0 || !Number.isInteger(quantity)) {
            return res.status(400).json({ message: 'Quantity must be a non-negative integer' });
        }

        // For reduce operation, reason and buyerName are required
        if (operation === 'reduce') {
            if (!buyerName) {
                return res.status(400).json({ message: 'Buyer name is required when reducing stock' });
            }
        }

        // For add operation, reason is required
        if (operation === 'add') {
            if (!reason) {
                return res.status(400).json({ message: 'Reason is required when adding stock' });
            }
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const previousQuantity = product.quantity;
        let quantityChanged;
        let newQuantity;

        if (operation === 'add') {
            quantityChanged = quantity;
            newQuantity = previousQuantity + quantity;
        } else {
            // reduce
            if (previousQuantity < quantity) {
                return res.status(400).json({ 
                    message: `Cannot reduce by ${quantity}. Current stock is only ${previousQuantity} units` 
                });
            }
            quantityChanged = -quantity;
            newQuantity = previousQuantity - quantity;
        }

        // Create stock history record
        const reasonText = operation === 'add' 
            ? reason 
            : `Sold to ${buyerName}${reason ? ' - ' + reason : ''}`;

        await StockHistory.create({
            product: productId,
            productName: product.proName,
            action: 'adjustment',
            quantityChanged,
            previousQuantity,
            newQuantity,
            reason: reason || 'Manual stock adjustment',
            changedBy: req.user._id
        });

        // Update product quantity
        product.quantity = newQuantity;
        await product.save();

        res.json({ 
            message: 'Stock updated successfully',
            product,
            quantityChanged,
            operation
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getStockHistory = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can view stock history' });
        }

        const { startDate, endDate, productId, action } = req.query;

        let filter = {};

        // Date filtering
        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                // Set end date to end of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        // Product filtering
        if (productId) {
            filter.product = productId;
        }

        // Action filtering
        if (action) {
            filter.action = action;
        }

        const history = await StockHistory.find(filter)
            .populate('product', 'proName')
            .populate('changedBy', 'userName email')
            .sort({ createdAt: -1 });

        res.json(history);

    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.recordStockChange = async (productId, productName, action, quantityChanged, previousQuantity, newQuantity, userId, reference, reason) => {
    try {
        await StockHistory.create({
            product: productId,
            productName,
            action,
            quantityChanged,
            previousQuantity,
            newQuantity,
            reference,
            reason: reason || `Stock ${action}`,
            changedBy: userId
        });
    } catch (error) {
        console.error('Error recording stock change:', error.message);
    }
};

exports.bulkRemoveStock = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can remove bulk stock' });
        }

        const { items } = req.body; // items = [{ productId, quantity, buyerName, reason }, ...]

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'No items provided for bulk removal' });
        }

        const results = [];
        const errors = [];

        for (const item of items) {
            try {
                const { productId, quantity, buyerName, reason } = item;

                if (!productId || !quantity || !buyerName) {
                    errors.push({
                        productId,
                        error: 'Product ID, quantity, and buyer name are required'
                    });
                    continue;
                }

                if (quantity < 0 || !Number.isInteger(quantity)) {
                    errors.push({
                        productId,
                        error: 'Quantity must be a non-negative integer'
                    });
                    continue;
                }

                const product = await Product.findById(productId);
                if (!product) {
                    errors.push({
                        productId,
                        error: 'Product not found'
                    });
                    continue;
                }

                if (product.quantity < quantity) {
                    errors.push({
                        productId: product._id,
                        productName: product.proName,
                        error: `Cannot reduce by ${quantity}. Current stock is only ${product.quantity} units`
                    });
                    continue;
                }

                const previousQuantity = product.quantity;
                const newQuantity = previousQuantity - quantity;

                // Create stock history record
                const reasonText = `Sold to ${buyerName}${reason ? ' - ' + reason : ''}`;

                await StockHistory.create({
                    product: productId,
                    productName: product.proName,
                    action: 'adjustment',
                    quantityChanged: -quantity,
                    previousQuantity,
                    newQuantity,
                    reason: reasonText,
                    changedBy: req.user._id
                });

                // Update product quantity
                product.quantity = newQuantity;
                await product.save();

                results.push({
                    productId,
                    productName: product.proName,
                    quantityRemoved: quantity,
                    newQuantity,
                    status: 'success'
                });

            } catch (itemError) {
                errors.push({
                    productId: item.productId,
                    error: itemError.message
                });
            }
        }

        res.json({
            message: 'Bulk stock removal completed',
            results,
            errors,
            successCount: results.length,
            errorCount: errors.length
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};
