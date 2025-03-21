const express = require('express');
const { getUserEvents, insertUserEvent } = require('../controllers/eventController');

const router = express.Router();

router.get('/get-user-events', getUserEvents);
router.post('/insert-user-event', insertUserEvent);

module.exports = router;
