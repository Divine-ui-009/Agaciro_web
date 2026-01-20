const Product = require('../models/Product');
const fs = require('fs');
const path = require('path')

const { DEFAULT_PRODUCT_IMAGE } = require('../config/constants');

exports.addProduct = async (req, res) => {
    try {
        if(req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins allowed.'});
        }

        const { name, description, price, quantity } = req.body;
        // store a web-accessible path (server serves /uploads)
        const productImage = req.file ? req.file.publicPath : DEFAULT_PRODUCT_IMAGE;

        const newProduct = await Product.create({
            proName: name,
            description,
            price,
            quantity,
            productImage,
            createdBy: req.user._id
        });
        res.status(201).json({ message: 'Product added successfully', product: newProduct });

    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.'});
        }

        const { id } = req.params;
        const product = await Product.findById(id);
        if(!product) return res.status(404).json({ message: 'Product not found.'});

        if(req.file){
            if(product.productImage && product.productImage !== DEFAULT_PRODUCT_IMAGE){
                // remove leading slash to form a relative path to the project root (e.g. 'uploads/file.png')
                const imageRelative = product.productImage.replace(/^\/+/, '');
                const oldImagePath = path.join(__dirname, '..', imageRelative);

                fs.unlink(oldImagePath, (err)=>{
                    if(err){
                        console.warn('Failed to delete product image', err.message);
                    }
                });
            }
            product.productImage = req.file.publicPath;
        }
        Object.assign(product, req.body);
        await product.save();

        res.json({ message: 'Product updated', product });

    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        if(req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.'});
        }

        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found.'});

        if(product.productImage && product.productImage !== DEFAULT_PRODUCT_IMAGE){
            const imageRelative = product.productImage.replace(/^\/+/, '');
            const oldImagePath = path.join(__dirname, '..', imageRelative);

            fs.unlink(oldImagePath, (err) => {
                if(err){
                    console.warn('Failed to delete product image: ', err.message)
                }
            })
        }
        
        res.json({ message: 'Product deleted', product });

    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find(); //.pupulate('createdBy','userName email');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message});
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
}
