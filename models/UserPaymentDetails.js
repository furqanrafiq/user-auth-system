const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const UserPaymentDetailSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    userId: { type: String, required: true },
    accountName: { type: String, default: null },
    bankName: { type: String, default: null },
    accountNumber: { type: String, default: null },
    iban: { type: String, default: null },
    isPrimary: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('userPaymentDetails', UserPaymentDetailSchema);
