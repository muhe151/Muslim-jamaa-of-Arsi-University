const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  isDonation: { type: Boolean, default: false }
});

const transactionSchema = new mongoose.Schema({
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'FinanceAccount', required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true, min: 0 },
  category: String,
  description: String,
  receiptImage: { type: String },
  status: { type: String, enum: ['pending', 'approved'], default: 'approved' }, // MUST BE HERE
  transactionDate: { type: Date, default: Date.now },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = {
  FinanceAccount: mongoose.model('FinanceAccount', accountSchema),
  FinanceTransaction: mongoose.model('FinanceTransaction', transactionSchema)
};