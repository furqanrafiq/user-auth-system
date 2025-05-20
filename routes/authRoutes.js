const express = require('express');
const { register, login, getUserDetails, sendEmail, activateAccount, resendActivationEmail, verifyOtp, resendOtp, forgetPassword, resetPassword, verifyToken } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/send-email', sendEmail);
router.post('/activate-account', activateAccount);
router.post('/forget-password', forgetPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-token', verifyToken);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/resend-activation-email', resendActivationEmail);
router.post('/login', login);


module.exports = router;
