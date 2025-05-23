const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getUserDetails, getAllVendors, insertUser, updateUser, deleteUser, getAllUsers, activateDeactivateUser, enableDisableTwoFactor, adminAnalytics } = require('../controllers/userController');

const router = express.Router();

router.get('/user-details', authMiddleware, getUserDetails);
router.post('/insert-user', authMiddleware, insertUser);
router.post('/update-user', authMiddleware, updateUser);
router.post('/delete-user', authMiddleware, deleteUser);
router.get('/get-all-users', authMiddleware, getAllUsers);
router.post('/activate-deactivate-user', authMiddleware, activateDeactivateUser);
router.post('/enable-disable-twofactor', authMiddleware, enableDisableTwoFactor);
router.get('/admin-analytics', authMiddleware, adminAnalytics);


module.exports = router;