const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { DEFAULT_USER_IMAGE } = require('../config/constants');

const userSchema = new mongoose.Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true, validate: {
        validator: function(v) {
            return /^(\+?\d{10,15})?$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
    }},
    password: {type: String, required: true},
    role: {type: String, enum: ['customer', 'admin'], default: 'customer' },
    profileImage: { type: String, default: DEFAULT_USER_IMAGE },
    createdAt: { type: Date, default: Date.now },
    isSuperAdmin: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Users', userSchema);  
