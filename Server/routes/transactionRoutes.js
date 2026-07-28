const express = require('express');
const {
  addTransaction,
  getAllTransactions,
  deleteTransaction,
  updateTransaction,
} = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, transactionRules } = require('../middleware/validators');

const router = express.Router();

// Every transaction route requires a valid auth token
router.use(authMiddleware);

// Add transaction
router.post('/add-transaction', transactionRules, validate, addTransaction);

// Get transactions (filtered)
router.post('/get-transactions', getAllTransactions);

// Delete transaction (requires transaction ID)
router.delete('/delete-transaction/:id', deleteTransaction);

// Update transaction (requires transaction ID)
router.put('/update-transaction/:id', transactionRules, validate, updateTransaction);

module.exports = router;
