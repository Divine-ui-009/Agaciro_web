const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Dynamic storage based on environment
let storage;

if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
    // Use Cloudinary storage in production
    const { storage: cloudinaryStorage } = require('./cloudinaryConfig');
    storage = cloudinaryStorage;
} else {
    // Use local storage in development
    // Ensure upload directory exists
    if (!fs.existsSync('uploads/products')) {
        fs.mkdirSync('uploads/products', { recursive: true });
    }

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'uploads/products/');
        },
        filename: (req, file, cb) => {
            const uniqueName =
                Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueName + path.extname(file.originalname));
        }
    });
}

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/ ;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);

    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed!'));
};

const uploadProductImage = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB
    }
});

module.exports = (req, res, next) => {
    uploadProductImage.single('productImage')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        if (req.file) {
            req.file.publicPath = `/uploads/products/${req.file.filename}`;
        }

        next();
    });
};
