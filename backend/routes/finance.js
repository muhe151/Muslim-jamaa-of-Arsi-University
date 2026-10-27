const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const { FinanceAccount, FinanceTransaction } = require('../models/Finance');

// 1. GET ALL ACCOUNTS
router.get('/accounts', auth, requireRole('admin'), async (req, res) => {
  try {
    const accounts = await FinanceAccount.find();
    const result = await Promise.all(accounts.map(async acc => {
      const txns = await FinanceTransaction.find({ account: acc._id, status: 'approved' });
      const income = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      return { ...acc.toObject(), balance: income - expense, income, expense };
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. GET PENDING DONATIONS (This is what the Admin Panel needs!)
router.get('/pending', auth, requireRole('admin'), async (req, res) => {
  try {
    const pending = await FinanceTransaction.find({ status: 'pending' })
      .populate('account', 'name')
      .populate('recordedBy', 'fullName email');
    res.json(pending);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. APPROVE A DONATION
router.put('/approve/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await FinanceTransaction.findByIdAndUpdate(req.params.id, { status: 'approved' });
    res.json({ message: 'Approved' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 4. REJECT A DONATION
router.delete('/reject/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await FinanceTransaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rejected' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. PUBLIC DONATIONS
router.get('/donations', auth, async (req, res) => {
  try {
    const donationAccounts = await FinanceAccount.find({ isDonation: true });
    const result = await Promise.all(donationAccounts.map(async acc => {
      const txns = await FinanceTransaction.find({ account: acc._id, type: 'income', status: 'approved' });
      const totalDonated = txns.reduce((s, t) => s + t.amount, 0);
      return { ...acc.toObject(), totalDonated };
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 6. CREATE ACCOUNT
router.post('/accounts', auth, requireRole('admin'), async (req, res) => {
  try {
    const acc = await FinanceAccount.create(req.body);
    res.json(acc);
  } catch (err) { res.status(400).json({ message: 'Account name already exists' }); }
});

// 7. DELETE ACCOUNT
router.delete('/accounts/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await FinanceTransaction.deleteMany({ account: req.params.id });
    await FinanceAccount.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 8. GET TRANSACTIONS (Approved only)
router.get('/transactions', auth, requireRole('admin'), async (req, res) => {
  try {
    const t = await FinanceTransaction.find({ status: 'approved' })
      .populate('account', 'name')
      .populate('recordedBy', 'fullName')
      .sort({ transactionDate: -1 });
    res.json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 9. ADD TRANSACTION (Admin Manual)
router.post('/transactions', auth, requireRole('admin'), async (req, res) => {
  try {
    const t = await FinanceTransaction.create({ ...req.body, status: 'approved', recordedBy: req.user.id });
    res.json(t);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;