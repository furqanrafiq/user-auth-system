const Event = require("../models/Event");

const getUserEvents = async (req, res) => {
    const { userId } = req.query;

    try {
        const events = await Event.aggregate([
            {
                $match: {
                    userId: userId
                }
            },
            {
                $lookup: {
                    from: "transactions",
                    localField: "uuid",
                    foreignField: "eventId",
                    as: "eventTransactions"
                }
            },
            {
                $addFields: {
                    totalSpent: {
                        $sum: "$eventTransactions.amount"
                    },
                    amountSpent: {
                        $cond: [
                            { $gt: ["$eventBudget", 0] },
                            {
                                $multiply: [
                                    { $divide: [{ $sum: "$eventTransactions.amount" }, "$eventBudget"] },
                                    100
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    uuid: 1,
                    userId: 1,
                    name: 1,
                    eventType: 1,
                    eventDate: 1,
                    eventLocation: 1,
                    eventBudget: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    eventTime: 1,
                    guestCount: 1,
                    totalSpent: 1,
                    amountSpent: { $round: ["$amountSpent", 2] }
                }
            }
        ]);

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


const getEventDetails = async (req, res) => {
    const { eventId } = req.query;
    try {
        const events = await Event.aggregate([
            {
                $match: {
                    uuid: eventId
                }
            },
            {
                $lookup: {
                    from: "transactions",
                    localField: "uuid",
                    foreignField: "eventId",
                    as: "eventTransactions"
                }
            },
            {
                $addFields: {
                    totalSpent: {
                        $sum: "$eventTransactions.amount"
                    },
                    amountSpent: {
                        $cond: [
                            { $gt: ["$eventBudget", 0] },
                            {
                                $multiply: [
                                    { $divide: [{ $sum: "$eventTransactions.amount" }, "$eventBudget"] },
                                    100
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    uuid: 1,
                    userId: 1,
                    name: 1,
                    eventType: 1,
                    eventDate: 1,
                    eventLocation: 1,
                    eventBudget: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    totalSpent: 1,
                    guestCount: 1,
                    eventTime: 1,
                    amountSpent: { $round: ["$amountSpent", 2] }
                }
            }
        ]);
        res.status(200).json(events[0]);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const insertUserEvent = async (req, res) => {
    const { eventType, eventDate, eventLocation, eventBudget, guestCount, userId } = req.body;

    try {
        let event = new Event({ eventType, eventDate, eventLocation, eventBudget, guestCount, userId });
        await event.save();

        res.status(201).json({ msg: 'Event saved successfully' });
    } catch (error) {
        res.status(400).json({ error: error });
    }
};

const updateUserEvent = async (req, res) => {
    const { eventType, eventDate, eventLocation, eventBudget, guestCount, userId, uuid } = req.body;
    try {
        const updatedGuest = await Event.updateOne(
            { uuid },
            { $set: { eventType, eventDate, eventLocation, eventBudget, guestCount, userId } }
        );
        res.status(201).json({ msg: 'Event updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: error });
    }
};

module.exports = { getUserEvents, insertUserEvent, getEventDetails, updateUserEvent };