const express = require('express');
const { getAllServices, insertService, getUserServices, insertUserService, getServicesProvidedByServiceName, getServiceDetails, deleteUserService, getRecommendedServices, getAllServiceProviders, getTopRatedServices, updateUserService, deleteUserServiceImage, getAllUserServices } = require('../controllers/serviceController');

const router = express.Router();

router.get('/get-all', getAllServices);
router.post('/insert', insertService);
router.get('/user-service', getUserServices);
router.get('/get-all-service-providers', getAllServiceProviders);
router.post('/insert-user-service', insertUserService);
router.post('/update-user-service', updateUserService);
router.post('/delete-user-service-image', deleteUserServiceImage);
router.get('/get-services', getServicesProvidedByServiceName);
router.get('/get-recommended-services', getRecommendedServices);
router.get('/get-service-details', getServiceDetails);
router.get('/delete-user-service', deleteUserService);
router.get('/top-rated-services', getTopRatedServices);
router.get('/get-all-user-services', getAllUserServices);

module.exports = router;
