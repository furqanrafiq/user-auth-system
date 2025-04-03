const express = require('express');
const { getAllServices, insertService, getUserServices, insertUserService, getServicesProvidedByServiceName, getServiceDetails, deleteUserService } = require('../controllers/serviceController');

const router = express.Router();

router.get('/get-all', getAllServices);
router.post('/insert', insertService);
router.get('/user-service', getUserServices);
router.post('/insert-user-service', insertUserService);
router.get('/get-services', getServicesProvidedByServiceName);
router.get('/get-service-details', getServiceDetails);
router.get('/delete-user-service', deleteUserService);

module.exports = router;
