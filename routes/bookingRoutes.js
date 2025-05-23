const express = require('express');
const { addVendor, getVendorBookings, getSavedVendors, setBookingEvent, sendRequestToVendor, acceptBooking, rejectBooking, getUserVendors, sendPaymentToVendor, receivePaymentFromUser, getAllBookings, getUserInvoices, downloadInvoice } = require('../controllers/bookingController');

const router = express.Router();

router.post('/add-vendor', addVendor);
router.get('/get-bookings', getVendorBookings);
router.get('/get-saved-vendors', getSavedVendors);
router.get('/get-user-vendors', getUserVendors);
router.post('/set-booking-event', setBookingEvent);
router.post('/send-request-to-vendor', sendRequestToVendor);
router.post('/accept-booking', acceptBooking);
router.post('/reject-booking', rejectBooking);
router.post('/send-payment-to-vendor', sendPaymentToVendor);
router.post('/receive-payment-from-user', receivePaymentFromUser);
router.get('/get-all-bookings', getAllBookings);
router.get('/get-user-invoices', getUserInvoices);
router.get('/download-invoice', downloadInvoice);

module.exports = router;
