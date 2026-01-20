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
    if (!fs.existsSync('uploads')) {
        fs.mkdirSync('uploads', { recursive: true });
    }

    storage = multer.diskStorage({
        destination(req, file, cb){
            cb(null, 'uploads/');
        },
        filename(req, file, cb){
            const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, unique + path.extname(file.originalname));
        }
    });
}

function fileFilter(req, file, cb){
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if(extname && mimetype) {
        cb(null, true)
    } else {
        cb(new Error('Only images are allowed'))
    }
}

const uploadUserImage = multer({
    storage,
    limits: { fileSize: 1 * 1024 * 1024},
    fileFilter
});

module.exports = uploadUserImage;