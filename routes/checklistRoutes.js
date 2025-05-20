const express = require('express');
const { insertUserChecklist, getUserChecklist, updateUserChecklist, deleteUserChecklist } = require('../controllers/checkListController');

const router = express.Router();

router.post('/insert-user-checklist', insertUserChecklist);
router.post('/update-user-checklist', updateUserChecklist);
router.post('/delete-user-checklist', deleteUserChecklist);
router.get('/get-user-checklist', getUserChecklist);
module.exports = router;
