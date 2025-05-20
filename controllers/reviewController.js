const Review = require("../models/Review");

const insertReview = async (req, res) => {
    const { userId, userName, description, rating, serviceId } = req.body;
    try {
        let newReview = new Review({ userId, description, rating, serviceId, userName });
        await newReview.save();
        res.status(201).json({ msg: 'Review submitted succesfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const activateDeactivateReview = async (req, res) => {
    const { isActive, uuid } = req.body;
    try {
        const updatedGuest = await Review.updateOne(
            { uuid },
            { $set: { isActive } }
        );
        res.status(201).json({ msg: 'Review updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


const getServiceReviews = async (req, res) => {
    const { serviceId } = req.query;
    try {
        const reviews = await Review.find({ serviceId, isActive: true });
        res.status(200).json(reviews);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


const getAllReviews = async (req, res) => {
    try {
        const vendors = await Review.find({});
        res.status(200).json(vendors);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports = { insertReview, getServiceReviews, activateDeactivateReview, getAllReviews };