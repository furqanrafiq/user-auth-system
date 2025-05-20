const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const UserSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVendor: { type: Boolean, default: false },
    serviceId: { type: String, default: null },
    serviceName: { type: String, default: null },
    phoneNumber: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    otp: { type: String, default: null },
    otpExpiry: { type: String, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Users', UserSchema);
