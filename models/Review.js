const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const Review = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    userId: { type: String, default: null }, //id of the user for which the guest has been added,
    userName: { type: String, default: null }, //name of the user for which the guest has been added,
    serviceId: { type: String, default: null }, //service for which review has been added
    description: { type: String, default: null }, //name of guest
    rating: { type: Number, default: null }, //name of guest
    isActive: { type: Boolean, default: false }, //name of guest
}, { timestamps: true });

module.exports = mongoose.model('review', Review);
