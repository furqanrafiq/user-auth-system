const express = require('express');
const { insertReview, getServiceReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post('/insert-review', insertReview);
router.get('/get-service-reviews', getServiceReviews);
module.exports = router;
