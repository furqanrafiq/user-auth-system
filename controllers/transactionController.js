const Checklist = require("../models/Checklist");
const Transaction = require("../models/Transaction");

const insertTransaction = async (req, res) => {
    const { userId, vendorName, eventId, category, transactionName, transactionDate, amount, paymentType, note } = req.body;
    try {
        let newTransaction = new Transaction({ userId, vendorName, eventId, category, transactionName, transactionDate, amount, paymentType, note });
        await newTransaction.save();
        res.status(201).json({ msg: 'Transaction added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateTransaction = async (req, res) => {
    const { uuid, userId, vendorName, eventId, category, transactionName, transactionDate, amount, paymentType, note } = req.body;
    try {
        const updatedGuest = await Transaction.updateOne(
            { uuid },
            { $set: { userId, vendorName, eventId, category, transactionName, transactionDate, amount, paymentType, note } }
        );
        res.status(201).json({ msg: 'Transaction updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserTransactions = async (req, res) => {
    const { userId, eventId } = req.query;
    try {
        const matchStage = {
            userId: userId,
        };

        if (eventId) {
            matchStage.eventId = eventId;
        }

        const userTransactions = await Transaction.aggregate([
            {
                $match: matchStage
            },
            {
                $lookup: {
                    from: "events",
                    localField: "eventId",
                    foreignField: "uuid",
                    as: "eventDetails"
                }
            },
            {
                $unwind: "$eventDetails"
            }
        ]);

        res.status(200).json(userTransactions);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteTransaction = async (req, res) => {
    const { transactionId } = req.query;
    try {
        const transaction = await Transaction.deleteOne({ uuid: transactionId });
        res.status(201).json({ msg: 'Transaction deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};



module.exports = { insertTransaction, getUserTransactions, updateTransaction, deleteTransaction };