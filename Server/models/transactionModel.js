const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userid: {
      type: String,
      required: [true, 'User ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: [true, 'Type is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    reference: {
      type: String,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    paymentMode: {
      type: String,
      required: [true, 'Payment mode is required'],
    },
    paymentBank: {
      type: String,
    },
  },
  { timestamps: true }
);

// ✅ Make sure the export is correct:
const transactionModel = mongoose.model('Transaction', transactionSchema);
module.exports = transactionModel;
