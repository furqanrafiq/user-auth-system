const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const UserServiceSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    userId: { type: String, required: true },
    serviceId: { type: String, required: true },
    serviceName: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number },
    city: {type: String}, 
    country: {type: String}, 
    lat: {type: String}, 
    long: {type: String}, 
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('UserService', UserServiceSchema);
