const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Import UUID generator

const TransactionSchema = new mongoose.Schema({
    uuid: { type: String, default: uuidv4, unique: true }, // Store UUID as a string
    userId: { type: String, default: null }, //id of the user for which the transaction has been added,
    vendorName: { type: String, default: null }, //vendor for which this transaction has been added
    eventId: { type: String, default: null }, //event for which this guest has been added
    category: { type: String, default: null }, //transaction category
    transactionName: { type: String, default: null }, //name of transaction
    transactionDate: { type: Date, default: null }, //date of transaction
    amount: { type: Number, default: null }, //transaction amount
    paymentType: { type: String, default: null }, //transaction payment type
    note: { type: String, default: null }, //note
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
