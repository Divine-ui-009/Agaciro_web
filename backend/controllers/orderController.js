const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
    try {
        const { orderItems, address, paymentMethod } = req.body;

        if(!orderItems || !Array.isArray(orderItems) || orderItems.length === 0){
            return res.status(400).json({ message: 'Please place some orders'});
        }

        const populatedOrderItems = [];
        let totalPrice = 0;

        for( const item of orderItems){
            const { productId, quantity } = item;
            if (!productId || !quantity || quantity <= 0){
                return res.status(404).json({ message: 'Please check your order for mistake' });
            }

            const product = await Product.findById(productId);
            if(!product){
                return res.status(404).json({ message: `Product not found: ${productId}` });
            }

            if(product.quantity < quantity){
                return res.status(400).json({ message: `Not enough quantity currently available for the product: ${product.proName}`});
            }

            const itemPrice = product.price *quantity;
            totalPrice += itemPrice;

            populatedOrderItems.push({
                product: product._id,
                name: product.proName,
                price: product.price,
                quantity
            });
        }

        const order = new Order({
            user: req.user._id,
            orderItems: populatedOrderItems,
            address,
            paymentMethod,
            totalPrice,
            status: 'Pending'
        });

        for(const item of populatedOrderItems){
            if( typeof item.quantity === 'number'){
                await Product.findByIdAndUpdate(item.product, {$inc: {quantity: -item.quantity} });
            }
        }

        res.status(201).json({ message: 'Order created successfully', order});

    } catch (error) {
        return res.status(500).json({ message: 'server error: '+ error.message });
    }
}


exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1});
        res.json(orders);

    }catch (error){
        res.status(500).json({ message: 'Server error: '+ error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        if(req.user.role !== 'admin'){
            return res.status(403).json({ message: 'Only admins can view orders' });
        }
        
        const orders = await Order.find().populate('user','userName email').sort({ createdAt: -1 });
        res.json(orders);

    } catch (error){
        res.status(500).json({ message: 'Server error: '+ error.message });
    }
}

exports.updateOrderStatus = async (req, res) => {
    try {
        if(req.user.role !== 'admin'){
            return res.status(403).json({ message: 'Only admins allowed'});
        }

        const orderId = req.params.id;
        const { status } = req.body;
        if(!status || !['Pending', 'Processing', 'Completed', 'Cancelled'].includes(status)){
            return res.status(400).json({ message: 'Invalid status value'});
        }

        const order = await Order.findById(orderId);
        if(!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        await order.save();

        res.json({ message: 'Order status updated successfully', order});
    }catch (err) {
        res.status(500).json({ message: 'Server error: '+ err.message });
    }
}

exports.deleteOrder = async (req, res) => {
    try {
        if(req.user.role !== 'admin'){
            return res.status(403).json({ message: 'Only admins allowed' });
        }

        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        if(!order) return res.status(404).json({ message: 'Order not found'});

        for( const item of order.orderItems ){
            if(typeof item.quantity === 'number'){
                await Product.findByIdAndUpdate(item.product, {$inc: {quantity: item.quantity } });  
            }
        }

        await order.deleteOne();
        res.json({ message: 'Order deleted and stock restored successfully' });

    } catch (err){
        res.status(500).json({ message: 'Server error: '+err.message });
    }
}
