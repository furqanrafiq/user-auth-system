const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getUserDetails } = require('../controllers/userController');

const router = express.Router();

router.get('/user-details', authMiddleware, getUserDetails);


module.exports = router;
