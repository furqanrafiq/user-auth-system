const express = require('express');
const { insertGuest, getAllUserGuests } = require('../controllers/guestListController');

const router = express.Router();

router.post('/insert-user-guests', insertGuest);
router.get('/get-user-guests', getAllUserGuests);
module.exports = router;
