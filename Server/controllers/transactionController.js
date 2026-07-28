const dayjs = require('dayjs');
const Transaction = require('../models/transactionModel');

// Add a new transaction
const addTransaction = async (req, res) => {
  try {
    const { amount, type, category, reference, description, date, paymentMode, paymentBank } = req.body;
    const newTransaction = await Transaction.create({
      userid: req.userId,
      amount,
      type,
      category,
      reference,
      description,
      date,
      paymentMode,
      paymentBank,
    });
    res.status(201).json({ success: true, message: 'Transaction added successfully', transaction: newTransaction });
  } catch (error) {
    console.error('Error adding transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to add transaction' });
  }
};

// Get all transactions belonging to the authenticated user
const getAllTransactions = async (req, res) => {
  try {
    const { frequency, selectedDate, type } = req.body;

    // Scope every query to the authenticated user - never trust a client-supplied userid
    let query = { userid: req.userId };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (frequency === 'custom' && selectedDate && selectedDate.length === 2) {
      const [startDate, endDate] = selectedDate;
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (frequency && frequency !== 'custom') {
      const startDate = dayjs().subtract(Number(frequency), 'days').toDate();
      query.date = {
        $gte: startDate,
        $lte: new Date(),
      };
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
};

// Delete a transaction - only if it belongs to the authenticated user
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Transaction.findOneAndDelete({ _id: id, userid: req.userId });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to delete transaction' });
  }
};

// Update a transaction - only if it belongs to the authenticated user
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, reference, description, date, paymentMode, paymentBank } = req.body;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, userid: req.userId },
      { amount, type, category, reference, description, date, paymentMode, paymentBank },
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, transaction: updatedTransaction });
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ success: false, message: 'Failed to update transaction' });
  }
};

module.exports = { addTransaction, getAllTransactions, deleteTransaction, updateTransaction };
