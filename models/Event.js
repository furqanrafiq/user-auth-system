const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const EventSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    time: { type: Date, required: true },
    location: { type: String, required: true },
    budget: { type: Number, required: true },
    type: { type: String, required: true },
    guestCount: { type: Number, required: true },
    userId: { type: String },
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
}, { timestamps: true });

module.exports = mongoose.model('Event', EventSchema);
