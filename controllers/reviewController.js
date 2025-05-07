const Review = require("../models/Review");

const insertReview = async (req, res) => {
    const { userId, userName, description, rating, serviceId } = req.body;
    try {
        let newReview = new Review({ userId, description, rating, serviceId, userName });
        await newReview.save();
        res.status(201).json({ msg: 'Review added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const getServiceReviews = async (req, res) => {
    const { serviceId } = req.query;
    try {
        const reviews = await Review.find({ serviceId });
        res.status(200).json(reviews);

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};



module.exports = { insertReview, getServiceReviews };