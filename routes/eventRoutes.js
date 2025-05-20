const express = require('express');
const { getUserEvents, insertUserEvent, getEventDetails, updateUserEvent } = require('../controllers/eventController');

const router = express.Router();

router.get('/get-user-events', getUserEvents);
router.post('/insert-user-event', insertUserEvent);
router.post('/update-user-event', updateUserEvent);
router.get('/event-details', getEventDetails);

module.exports = router;
