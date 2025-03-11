const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    type: { type: String, required: true },
    guestCount: { type: Number },
    budget: { type: Number },
    venueBooked: { type: Boolean },
    venueLocation: { type: String },
    date: { type: Date },
});

module.exports = mongoose.model('Service', EventSchema);
