const express = require('express');
const { register, login, getUserDetails } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);


module.exports = router;
