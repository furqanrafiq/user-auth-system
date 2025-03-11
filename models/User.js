const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const UserSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVendor: { type: Boolean },
    serviceId: { type: String },
    serviceName: { type: String },
    phoneNumber: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Users', UserSchema);
