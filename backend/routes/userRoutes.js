const express = require('express');
const router = express.Router();

const { 
    registerUser, loginUser, updateProfileImage, updateProfile, removeProfileImage 
} = require('../controllers/userController');

const uploadUserImage = require('../middleware/uploadUserImage');
const { protect } = require('../middleware/authMiddleware');
const processImage = require('../middleware/imageProcessor');

router.post('/register', registerUser);
router.post('/login', loginUser);

router.put('/profile', protect, updateProfile);
router.put('/profile-image', protect, uploadUserImage.single('profileImage'), processImage, updateProfileImage);
router.delete('/profile-image', protect, removeProfileImage);

module.exports = router;