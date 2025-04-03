const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const ServiceSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    createdAt: { type: Date, default: Date.now },
    vendorId: { type: String }
});

module.exports = mongoose.model('Service', ServiceSchema);
