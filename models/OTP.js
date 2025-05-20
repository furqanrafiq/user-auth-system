const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const OTPSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    userId: { type: String, required: true },
    OTP: { type: String, required: true },
    expiryTime: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('otp', OTPSchema);
