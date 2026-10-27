const router = require('express').Router();
const Semester = require('../models/Semester');
const { auth, requireRole } = require('../middleware/auth');

// Everyone can see the semesters
router.get('/', auth, async (req, res) => {
  const semesters = await Semester.find().sort({ startDate: 1 });
  res.json(semesters);
});

// Only Admin can create/update
router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const semester = await Semester.create(req.body);
    res.json(semester);
  } catch (err) {
    res.status(400).json({ message: 'Semester already exists' });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  await Semester.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;