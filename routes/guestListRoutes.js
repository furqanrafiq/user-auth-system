const express = require('express');
const { insertGuest, getAllUserGuests, updateGuest, deleteUserGuest } = require('../controllers/guestListController');

const router = express.Router();

router.post('/insert-user-guests', insertGuest);
router.post('/update-user-guests', updateGuest);
router.post('/delete-user-guest', deleteUserGuest);
router.get('/get-user-guests', getAllUserGuests);
module.exports = router;
