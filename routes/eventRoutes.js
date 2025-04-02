const express = require('express');
const { getUserEvents, insertUserEvent, getEventDetails } = require('../controllers/eventController');

const router = express.Router();

router.get('/get-user-events', getUserEvents);
router.post('/insert-user-event', insertUserEvent);
router.get('/event-details', getEventDetails);

module.exports = router;
