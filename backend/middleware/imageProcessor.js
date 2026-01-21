const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { cloudinary } = require('./cloudinaryConfig');

const processImage = async(req, res, next) => {
    if(!req.file) return next();

    try {
        // If using Cloudinary (production), upload directly
        if (process.env.NODE_ENV === 'production' && process.env.CLOUDINARY_CLOUD_NAME) {
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'agaciro-products',
                transformation: [
                    { width: 500, height: 500, crop: 'limit' },
                    { quality: 'auto' }
                ]
            });

            // Clean up temp file
            fs.unlinkSync(req.file.path);

            // Store Cloudinary URL
            req.file.publicPath = result.secure_url;
            req.file.cloudinaryId = result.public_id;
        } else {
            // Local development - keep existing logic
            const folder = path.basename(req.file.destination);
            const optimizedName = `optimized-S${Date.now()}.jpeg`;

            const optimizedPath = path.join(
                'uploads',
                folder,
                optimizedName
            );

            await sharp(req.file.path)
                .resize(500, 500, { fit: 'inside' })
                .jpeg({ quality: 80 })
                .toFile(optimizedPath);

            fs.unlinkSync(req.file.path);

            req.file.publicPath = `/uploads/${folder}/${optimizedName}`;
            req.file.path = optimizedPath;
        }

        next();
    } catch (error) {
        console.error('Image processing error:', error);
        next(error);
    }
};

module.exports = processImage;
