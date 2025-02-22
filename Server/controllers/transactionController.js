const Transaction = require('../models/transactionModel');
const dayjs = require('dayjs')
// Add a new transaction
const addTransaction = async (req, res) => {
  try {
    const newTransaction = new Transaction(req.body);
    await newTransaction.save();
    res.status(201).json({ message: "Transaction added successfully" });
  } catch (error) {
    console.error("Error adding transaction:", error);
    res.status(500).json({ message: "Failed to add transaction" });
  }
};

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const { userid, frequency, selectedDate, type } = req.body;

    // Base query to filter by userid
    let query = { userid };

    // Filter by type (if provided and not "all")
    if (type && type !== "all") {
      query.type = type;
    }

    // Filter by date range (if frequency is "custom" and selectedDate is provided)
    if (frequency === "custom" && selectedDate && selectedDate.length === 2) {
      const [startDate, endDate] = selectedDate;
      query.date = {
        $gte: new Date(startDate), // Greater than or equal to start date
        $lte: new Date(endDate),   // Less than or equal to end date
      };
    } else if (frequency && frequency !== "custom") {
      // Filter by frequency (e.g., last 7 days, last 30 days, etc.)
      const startDate = dayjs().subtract(frequency, "days").toDate();
      query.date = {
        $gte: startDate, // Greater than or equal to the calculated start date
        $lte: new Date(), // Less than or equal to the current date
      };
    }

    // Fetch transactions based on the constructed query
    const transactions = await Transaction.find(query).sort({ date: -1 }); // Sort by date in descending order

    res.status(200).json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

// Delete a transaction
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    await Transaction.findByIdAndDelete(id);
    res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Failed to delete transaction" });
  }
};

// Update a transaction
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTransaction = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updatedTransaction);
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Failed to update transaction" });
  }
};

module.exports = { addTransaction, getAllTransactions, deleteTransaction, updateTransaction };