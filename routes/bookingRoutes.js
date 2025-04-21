const express = require('express');
const { addVendor, getVendorBookings, getSavedVendors, setBookingEvent, sendRequestToVendor } = require('../controllers/bookingController');

const router = express.Router();

router.post('/add-vendor', addVendor);
router.get('/get-bookings', getVendorBookings);
router.get('/get-saved-vendors', getSavedVendors);
router.post('/set-booking-event', setBookingEvent);
router.post('/send-request-to-vendor', sendRequestToVendor);

module.exports = router;
