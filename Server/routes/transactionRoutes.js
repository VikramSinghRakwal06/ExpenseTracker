const express = require("express");
const {
  addTransaction,
  getAllTransactions,
  deleteTransaction,
  updateTransaction, // Import update controller
} = require("../controllers/transactionController");

const router = express.Router();

// Add transactions
router.post("/add-transaction", addTransaction);

// Get Transactions
router.post("/get-transactions", getAllTransactions);

// Delete Transaction (Requires transaction ID)
router.delete("/delete-transaction/:id", deleteTransaction);

// Update Transaction (Requires transaction ID)
router.put("/update-transaction/:id", updateTransaction); // New route for updating transactions

module.exports = router;
