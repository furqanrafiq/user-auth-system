const express = require('express');
const { insertVendor, updateVendor, deleteVendor, getAllVendors, activateDeactivateVendor } = require('../controllers/vendorController');

const router = express.Router();

router.post('/insert-vendor', insertVendor);
router.post('/update-vendor', updateVendor);
router.post('/delete-vendor', deleteVendor);
router.get('/get-all-vendors', getAllVendors);
router.post('/activate-deactivate-vendor', activateDeactivateVendor);
module.exports = router;
