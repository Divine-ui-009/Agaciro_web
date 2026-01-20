const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');  

const { DEFAULT_USER_IMAGE } = require('../config/constants');

// helper to generate JWT tokens
const generateToken = (id, role='customer') => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}


exports.registerUser = async (req, res) => {
    const { userName, email, phone, password } = req.body;

    try {
        const emailExists = await User.findOne({ email });
        if(emailExists) { return res.status(400).json({ message: 'User with this email already exists' }); }

        if(phone) {
            const phoneExists = await User.findOne({ phone });
            if(phoneExists) return res.status(400).json({ message: 'User with this phone number already exists'});
        }

        const newUser = await User.create({ userName, email, phone, password  });
        res.status(201).json({
            _id: newUser._id,
            name: newUser.userName,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role,
            profileImage: newUser.profileImage,
            token: generateToken(newUser._id, newUser.role)
        });
    }catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message});
    }
};

exports.loginUser = async (req, res) => {

    try {
            const password = req.body.password;
            const identifier = req.body.identifier || req.body.email || req.body.phone;

        // basic validation
            if (!identifier || !password) {
                return res.status(400).json({ message: 'Email/Phone and password are required' });
            }

        const lookup = typeof identifier === 'string' ? identifier.trim() : identifier;
        const user = await User.findOne({ $or: [{ email: lookup }, { phone: lookup }] });

        if(!user) return res.status(401).json({message: 'Invalid email/phone or password' });
        
        const isMatch = await user.matchPassword(password);
        if(!isMatch) return res.status(401).json({ message: 'Invalid email/phone or password' });

            const token = generateToken(user._id, user.role);

        res.json({
            message: "login successful",
            token,
            user: {
                id: user._id,
                name: user.userName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profileImage: user.profileImage
               }
            });
    } catch (error) {
        res.status(500).json({ message: 'server error: ' + error.message });
    }
};

exports.updateProfileImage = async (req, res) => {
    try {
        if (!req.file){
            return res.status(400).json({ message: 'No image uploaded' });
        }

        const user = await User.findById(req.user.id);
        if(!user) return res.status(404).json({ message: 'User not found' });

        if(
            user.profileImage && 
            user.profileImage !== DEFAULT_USER_IMAGE
        ) {
            const oldRelative = user.profileImage.replace(/^\/+/, '');
            const oldPath = path.join(__dirname, '..', oldRelative);

            fs.unlink(oldPath, (err) => {
                if(err) {
                    console.warn('Failed to delete old profile image: ', 
                        err.message
                    );
                }
            });
        }

        user.profileImage = req.file.publicPath;
        await user.save();

        res.json({
            message: 'Profile image updated successfully',
            profileImage: user.profileImage
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error: '+ error.message });
    }
};

exports.removeProfileImage = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if(!user) return res.status(404).json({ message: 'User not found' });

        if(
            user.profileImage && 
            user.profileImage !== DEFAULT_USER_IMAGE
        ) {
            const oldRelative = user.profileImage.replace(/^\/+/, '');
            const oldPath = path.join(__dirname, '..', oldRelative);

            fs.unlink(oldPath, (err) => {
                if(err) {
                    console.warn('Failed to delete old profile image: ', 
                        err.message
                    );
                }
            });
        }

        user.profileImage = DEFAULT_USER_IMAGE;
        await user.save();

        res.json({
            message: 'Profile image removed successfully',
            profileImage: user.profileImage
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error: '+ error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ message: 'Email already in use' });
            }
            user.email = email;
        }

        // Check if phone is being changed and if it's already taken
        if (phone !== undefined && phone !== user.phone) {
            if (phone) {
                const phoneExists = await User.findOne({ phone });
                if (phoneExists) {
                    return res.status(400).json({ message: 'Phone number already in use' });
                }
            }
            user.phone = phone;
        }

        if (name) user.userName = name;

        await user.save();

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.userName,
                email: user.email,
                phone: user.phone,
                role: user.role,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
};