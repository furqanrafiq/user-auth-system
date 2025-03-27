const Event = require("../models/Event");

const getUserEvents = async (req, res) => {
    const { userId } = req.query;
    try {
        const events = await Event.find({ userId });
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const insertUserEvent = async (req, res) => {
    const { type, date, time, location, budget, guestCount, userId } = req.body;

    try {
        let event = new Event({ type, date, time, location, budget, guestCount, userId });
        await event.save();

        res.status(201).json({ msg: 'Event saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

module.exports = { getUserEvents, insertUserEvent };