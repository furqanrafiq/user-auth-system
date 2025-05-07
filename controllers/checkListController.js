const Checklist = require("../models/Checklist");

const insertUserChecklist = async (req, res) => {
    const { userId, description, category, event, dueDate } = req.body;
    try {
        let newChecklist = new Checklist({ userId, description, category, eventId: event, dueDate, });
        await newChecklist.save();
        res.status(201).json({ msg: 'Checklist task added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const updateUserChecklist = async (req, res) => {
    const { userId, description, category, event, dueDate, uuid } = req.body;
    try {
        const updatedGuest = await Checklist.updateOne(
            { uuid },
            { $set: { description, category, eventId: event, dueDate } }
        );
        res.status(201).json({ msg: 'Checklist task updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getUserChecklist = async (req, res) => {
    const { userId, eventId } = req.query;
    try {
        const matchStage = {
            userId: userId,
        };

        if (eventId) {
            matchStage.eventId = eventId;
        }

        const userCheckList = await Checklist.aggregate([
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
        res.status(200).json(userCheckList);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const deleteUserChecklist = async (req, res) => {
    const { checklistId } = req.query;
    try {
        const events = await Checklist.deleteOne({ uuid: checklistId });
        res.status(201).json({ msg: 'Checklist deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};



module.exports = { insertUserChecklist, getUserChecklist, updateUserChecklist, deleteUserChecklist };