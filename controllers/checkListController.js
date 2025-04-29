const Checklist = require("../models/Checklist");

const insertUserChecklist = async (req, res) => {
    const { userId, description, category, eventId,eventName, dueDate } = req.body;
    try {
        let newChecklist = new Checklist({ userId, description, category, eventId, dueDate, });
        await newChecklist.save();
        res.status(201).json({ msg: 'Checklist task added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserChecklist = async (req, res) => {
    const { userId } = req.query;
    try {
        const userCheckList = await Checklist.find({ userId });
        res.status(200).json(userCheckList);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = { insertUserChecklist, getUserChecklist };