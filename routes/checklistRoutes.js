const express = require('express');
const { insertUserChecklist, getUserChecklist } = require('../controllers/checkListController');

const router = express.Router();

router.post('/insert-user-checklist', insertUserChecklist);
router.get('/get-user-checklist', getUserChecklist);
module.exports = router;
