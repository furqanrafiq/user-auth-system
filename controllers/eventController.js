const Event = require("../models/Event");

const getUserEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const insertUserEvent = async (req, res) => {
    const { event } = req.body;

    try {
        let event = await Event.findOne({ name });
        if (event) return res.status(400).json({ msg: 'Event already exists' });

        event = new Event({ name });
        await event.save();

        res.status(201).json({ msg: 'Event saved successfully' });
    } catch (error) {
        res.status(500).json({ error: error });
    }
};

module.exports = { getUserEvents, insertUserEvent };