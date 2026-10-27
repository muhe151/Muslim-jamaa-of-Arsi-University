const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const Schedule = require('../models/Schedule');

// Get schedules based on role
router.get('/', auth, async (req, res) => {
  let filter = {};
  
  if (req.user.role === 'ustaz') {
    filter.ustaz = req.user.id;
  } else if (req.user.role === 'student') {
    // We don't filter here by student ID anymore. The student dashboard fetches specific ones.
  }
  
  const schedules = await Schedule.find(filter)
    .populate('ustaz', 'fullName')
    .sort({ sessionDate: 1 });
  res.json(schedules);
});

router.post('/', auth, requireRole('admin'), async (req, res) => {
  try {
    const s = await Schedule.create({ ...req.body, createdBy: req.user.id });
    res.json(s);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  await Schedule.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});
// UPDATE a schedule
router.put('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    );
    res.json(updatedSchedule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;