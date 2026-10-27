const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const UstazProfile = require('../models/UstazProfile');
const { FinanceAccount, FinanceTransaction } = require('../models/Finance');

// Configure multer for registration screenshots
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'receipts');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `receipt-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.post('/register', upload.single('receipt'), async (req, res) => {
  try {
    // req.body holds text fields, req.file holds the screenshot
    const { email, password, fullName, role, profile } = req.body;
    // Parse the profile string back to JSON
    const parsedProfile = JSON.parse(profile);

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email, password: hashed, fullName,
      role: role === 'ustaz' ? 'ustaz' : 'student'
    });

    if (user.role === 'student') {
      await StudentProfile.create({ user: user._id, ...parsedProfile });
    } else {
      await UstazProfile.create({ user: user._id, ...parsedProfile });
    }
    // --- Handle Registration Payment & Receipt ---
    if (req.body.paymentAmount && Number(req.body.paymentAmount) > 0) {
      let account = await FinanceAccount.findOne({ name: 'General Fund' });
      if (!account) {
        account = await FinanceAccount.create({ name: 'General Fund', description: 'Main Jama\'aa fund' });
      }

      const receiptPath = req.file ? req.file.filename : null;

      await FinanceTransaction.create({
        account: account._id,
        type: 'income',
        amount: Number(req.body.paymentAmount),
        category: `Registration Fee (${req.body.paymentMethod})`,
        description: `Paid by ${fullName}`,
        receiptImage: receiptPath,
        status: 'pending', // <--- MUST BE PENDING
        recordedBy: user._id 
      });
    }
    // ----------------------------------------

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user._id, email, fullName, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user._id, email, fullName: user.fullName, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;