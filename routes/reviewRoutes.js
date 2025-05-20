const express = require('express');
const { insertReview, getServiceReviews, activateDeactivateReview, getAllReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post('/insert-review', insertReview);
router.get('/get-service-reviews', getServiceReviews);
router.post('/activate-deactivate-review', activateDeactivateReview);
router.get('/get-all-reviews', getAllReviews);
module.exports = router;
