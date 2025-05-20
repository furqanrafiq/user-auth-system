const express = require('express');
const { insertTransaction, updateTransaction, deleteTransaction, getUserTransactions } = require('../controllers/transactionController');

const router = express.Router();

router.post('/insert-transaction', insertTransaction);
router.post('/update-transaction', updateTransaction);
router.post('/delete-transaction', deleteTransaction);
router.get('/get-user-transactions', getUserTransactions);
module.exports = router;
