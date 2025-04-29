const Guests = require("../models/Guests");

const insertGuest = async (req, res) => {
    const { userId, firstName, lastName, email, phoneNumber, title } = req.body;
    try {
        const guest = await Guests.findOne({ email });
        if (guest) {
            return res.status(400).json({ msg: "Guest already added" });
        }
        let newGuest = new Guests({ userId, firstName, lastName, email, phoneNumber, title });
        await newGuest.save();
        res.status(201).json({ msg: 'Guest added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getAllUserGuests = async (req, res) => {
    const { userId } = req.query;
    try {
        const events = await Guests.find({ userId });
        res.status(200).json(events);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};



module.exports = { insertGuest, getAllUserGuests };