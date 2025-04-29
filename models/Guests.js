const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const GuestSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    eventId: { type: String, default: null }, //event for which this guest has been added
    isRequestSent: { type: Boolean, default: false }, //is request sent to guest
    firstName: { type: String, default: null }, //name of guest
    lastName: { type: String, default: null }, //name of guest
    title: { type: String, default: null }, //name of guest
    email: { type: String, default: null }, //email of guest
    phoneNumber: { type: String, default: null }, //phone number of guest,
    userId: { type: String, default: null }, //id of the user for which the guest has been added,
}, { timestamps: true });

module.exports = mongoose.model('Guests', GuestSchema);
