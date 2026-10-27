const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const UstazProfile = require('../models/UstazProfile');
const Schedule = require('../models/Schedule');

// USTAZ: Get my students (based on the Kitab I teach)
router.get('/my-students', auth, requireRole('ustaz'), async (req, res) => {
  try {
    // 1. Find the Kitabs this Ustaz is assigned to teach in the schedule
    const mySchedules = await Schedule.find({ ustaz: req.user.id });
    const myKitabs = [...new Set(mySchedules.map(s => s.targetKitab))];

    // 2. Find all students who registered for those Kitabs
    let students = [];
    if (myKitabs.length > 0) {
      const profiles = await StudentProfile.find({ 
        kitabPreferences: { $in: myKitabs } 
      }).populate('user', 'fullName email');

      students = profiles.map(p => ({
        _id: p.user?._id,
        fullName: p.user?.fullName || 'Unknown',
        email: p.user?.email || 'N/A',
        kitab: p.kitabPreferences,
        quranLevel: p.quranLevel,
        islamicEducationStatus: p.islamicEducationStatus,
        phone: p.phone
      }));
    }

    res.json({ students, mySchedules });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: list all ustaz (kept for the Admin Panel)
router.get('/all', auth, requireRole('admin'), async (req, res) => {
  const ustaz = await User.find({ role: 'ustaz' }).select('-password');
  res.json(ustaz);
});

module.exports = router;