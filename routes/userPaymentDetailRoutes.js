const express = require('express');
const { insertUserPaymentDetails, updateUserPaymentDetails, deleteUserPaymentDetails, getUserPaymentDetails, getVendorPaymentDetails } = require('../controllers/userPaymentDetailsController');

const router = express.Router();

router.post('/insert-user-payment-details', insertUserPaymentDetails);
router.post('/update-user-payment-details', updateUserPaymentDetails);
router.post('/delete-user-payment-details', deleteUserPaymentDetails);
router.get('/get-user-payment-details', getUserPaymentDetails);
router.get('/get-vendor-payment-details', getVendorPaymentDetails);
module.exports = router;
