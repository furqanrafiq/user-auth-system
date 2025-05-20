const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const ChecklistSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    userId: { type: String, default: null }, //id of the user for which the guest has been added,
    eventId: { type: String, default: null }, //event for which this guest has been added
    description: { type: String, default: null }, //name of guest
    category: { type: String, default: null }, //name of guest
    dueDate: { type: Date, default: null }, //name of guest
}, { timestamps: true });

module.exports = mongoose.model('Checklist', ChecklistSchema);
