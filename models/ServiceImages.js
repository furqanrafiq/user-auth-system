const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const ServiceImagesSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    userServiceId: { type: String, required: true },
    imagePath: { type: String }
});

module.exports = mongoose.model('ServiceImages', ServiceImagesSchema);
