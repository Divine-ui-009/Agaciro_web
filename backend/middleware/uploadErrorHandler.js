const multer = require('multer');

const uploadErrorHandler = (err, req, res, next) => {
    //Multer-specific error handling
    if(err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Please upload a smaller image'});
        }

        return res.status(400).json({ message: err.message });
    }

    //Custom file filter errors
    if(err) {
        return res.status(400).json({ message: err.message || 'File upload failed'});
    }

    next();

};

module.exports = uploadErrorHandler;