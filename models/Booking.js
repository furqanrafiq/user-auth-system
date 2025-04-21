const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const BookingSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    serviceProviderId: { type: String }, //user who is providing service
    serviceRequestorId: { type: String }, //user who is requesting service
    userServiceId: { type: String }, //service that is being requested from the provider
    eventId: { type: String, default: null }, //event for which this booking has been done
    isApproved: { type: Boolean, default: false }, //service that is being requested from the provider
    isRejected: { type: Boolean, default: false }, //service that is being requested from the provider
    isRequestSent: { type: Boolean, default: false }, //service that is being requested from the provider
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
