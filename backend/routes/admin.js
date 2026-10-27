const router = require('express').Router();
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Assignment = require('../models/Assignment');

// List all students
router.get('/students', auth, requireRole('admin'), async (req, res) => {
  const users = await User.find({ role: 'student' }).select('-password');
  const profiles = await StudentProfile.find();
  const merged = users.map(u => {
    const p = profiles.find(p => p.user.toString() === u._id.toString());
    return {
      id: u._id,
      email: u.email,
      fullName: u.fullName,
      phone: p?.phone || '',
      region: p?.region || '',
      zone: p?.zone || '',
      city: p?.city || '',
      islamicEducationStatus: p?.islamicEducationStatus || '',
      quranLevel: p?.quranLevel || '',
      kitabPreferences: p?.kitabPreferences?.join('; ') || '',
      enrollmentDate: p?.enrollmentDate
    };
  });
  res.json(merged);
});

// Export students as CSV
router.get('/students/export/csv', auth, requireRole('admin'), async (req, res) => {
  const users = await User.find({ role: 'student' }).select('-password');
  const profiles = await StudentProfile.find();
  const rows = users.map(u => {
    const p = profiles.find(p => p.user.toString() === u._id.toString());
    return {
      Email: u.email,
      FullName: u.fullName,
      Phone: p?.phone || '',
      Region: p?.region || '',
      Zone: p?.zone || '',
      City: p?.city || '',
      IslamicEducation: p?.islamicEducationStatus || '',
      QuranLevel: p?.quranLevel || '',
      KitabPreferences: p?.kitabPreferences?.join('; ') || ''
    };
  });
  const parser = new Parser();
  const csv = parser.parse(rows);
  res.header('Content-Type', 'text/csv');
  res.attachment('students.csv');
  res.send(csv);
});

// Export students as PDF
router.get('/students/export/pdf', auth, requireRole('admin'), async (req, res) => {
  const users = await User.find({ role: 'student' }).select('-password');
  const profiles = await StudentProfile.find();

  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=students.pdf');
  doc.pipe(res);

  doc.fontSize(18).text('Muslim Jama\'aa — Arsi University', { align: 'center' });
  doc.fontSize(12).text('Student List', { align: 'center' });
  doc.moveDown();

  users.forEach((u, i) => {
    const p = profiles.find(p => p.user.toString() === u._id.toString());
    doc.fontSize(10)
      .text(`${i + 1}. ${u.fullName} — ${u.email}`)
      .text(`   ${p?.region || '-'} / ${p?.zone || '-'} / ${p?.city || '-'} | Quran: ${p?.quranLevel || '-'} | Islamic: ${p?.islamicEducationStatus || '-'}`)
      .moveDown(0.3);
  });
  doc.end();
});

// Assign student to ustaz
router.post('/assignments', auth, requireRole('admin'), async (req, res) => {
  const { ustaz, student, kitabName } = req.body;
  const a = await Assignment.create({ ustaz, student, kitabName });
  res.json(a);
});

router.get('/assignments', auth, requireRole('admin'), async (req, res) => {
  const a = await Assignment.find()
    .populate('ustaz', 'fullName')
    .populate('student', 'fullName');
  res.json(a);
});

router.delete('/assignments/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
const Complaint = require('../models/Complaint');

// GET all complaints
router.get('/complaints', auth, requireRole('admin'), async (req, res) => {
  const complaints = await Complaint.find().populate('student', 'fullName email').sort({ createdAt: -1 });
  res.json(complaints);
});

// REPLY to a complaint
router.put('/complaints/:id', auth, requireRole('admin'), async (req, res) => {
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id, 
    { adminReply: req.body.reply, status: 'resolved' }, 
    { new: true }
  );
  res.json(complaint);
});

// GET Participation Report
router.get('/participation-report', auth, requireRole('admin'), async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // 1. Total Students & Ustaz
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalUstaz = await User.countDocuments({ role: 'ustaz' });

    // 2. Registered This Year
    const studentsThisYear = await User.countDocuments({ 
      role: 'student', 
      createdAt: { $gte: startOfYear, $lte: endOfYear } 
    });

    // 3. Active Participation (Students assigned to an Ustaz/Kitab)
    const activeAssignments = await Assignment.distinct('student');
    const activeStudents = activeAssignments.length;
    const activeUstaz = await Assignment.distinct('ustaz');

    // 4. Breakdown by Quran Level
    const studentProfiles = await StudentProfile.find().populate('user');
    const quranLevels = { beginner: 0, intermediate: 0, hafiz: 0 };
    studentProfiles.forEach(p => {
      if (quranLevels[p.quranLevel] !== undefined) quranLevels[p.quranLevel]++;
    });

    res.json({ 
      totalStudents, 
      studentsThisYear,
      activeStudents, 
      totalUstaz, 
      activeUstaz: activeUstaz.length,
      quranLevels
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET Grouped Students by Kitab for the UI Table
router.get('/grouped-by-kitab', auth, requireRole('admin'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('fullName email');
    const profiles = await StudentProfile.find();
    const assignments = await Assignment.find({ status: 'active' }).populate('ustaz', 'fullName');
    const schedules = await Schedule.find();

    const result = students.map(student => {
      const profile = profiles.find(p => p.user.toString() === student._id.toString());
      const assignment = assignments.find(a => a.student.toString() === student._id.toString());
      
      // Find a schedule to determine the semester
      const schedule = schedules.find(s => s.student && s.student.toString() === student._id.toString());
      const semester = schedule ? schedule.semester : 'Not Assigned';

      return {
        id: student._id,
        name: student.fullName,
        email: student.email,
        kitab: profile?.kitabPreferences?.join(', ') || 'None',
        ustaz: assignment?.ustaz?.fullName || 'Unassigned',
        semester: semester
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// GET Grouped Assignments for Reports
router.get('/grouped-assignments', auth, requireRole('admin'), async (req, res) => {
  try {
    const assignments = await Assignment.find({ status: 'active' })
      .populate('ustaz', 'fullName')
      .populate('student', 'fullName email');

    const grouped = {};
    assignments.forEach(a => {
      const key = `${a.ustaz?._id || 'none'}-${a.kitabName || 'none'}`;
      if (!grouped[key]) {
        grouped[key] = {
          ustazName: a.ustaz?.fullName || 'Unassigned',
          kitabName: a.kitabName || 'None',
          students: []
        };
      }
      grouped[key].students.push({
        name: a.student?.fullName,
        email: a.student?.email
      });
    });

    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Export Grouped Assignments to PDF
router.get('/grouped-assignments/pdf', auth, requireRole('admin'), async (req, res) => {
  try {
    const assignments = await Assignment.find({ status: 'active' })
      .populate('ustaz', 'fullName')
      .populate('student', 'fullName email');

    const grouped = {};
    assignments.forEach(a => {
      const key = `${a.ustaz?._id || 'none'}-${a.kitabName || 'none'}`;
      if (!grouped[key]) {
        grouped[key] = {
          ustazName: a.ustaz?.fullName || 'Unassigned',
          kitabName: a.kitabName || 'None',
          students: []
        };
      }
      grouped[key].students.push({
        name: a.student?.fullName,
        email: a.student?.email
      });
    });

    const groups = Object.values(grouped);
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=grouped_students.pdf');
    doc.pipe(res);

    doc.fontSize(18).text("Muslim Jama'aa - Arsi University", { align: 'center' });
    doc.fontSize(12).text('Grouped Student Assignments', { align: 'center' });
    doc.moveDown(2);

    let y = 120;
    const tableTop = 120;
    const itemHeight = 25;

    doc.font('Helvetica-Bold').fontSize(11);
    doc.rect(40, tableTop, 515, itemHeight).fillAndStroke('#198754', '#198754');
    doc.fillColor('white').text('Ustaz Name', 50, tableTop + 7);
    doc.text('Kitab Name', 160, tableTop + 7);
    doc.text('Student Name', 280, tableTop + 7);
    doc.text('Student Email', 400, tableTop + 7);

    y = tableTop + itemHeight;
    doc.font('Helvetica').fontSize(10).fillColor('black');

    groups.forEach((group) => {
      group.students.forEach((student, index) => {
        if (y % 50 === 0) {
          doc.rect(40, y, 515, itemHeight).fill('#f8f9fa');
        }
        doc.fillColor('black');
        if (index === 0) {
          doc.text(group.ustazName, 50, y + 7);
          doc.text(group.kitabName, 160, y + 7);
        }
        doc.text(student.name, 280, y + 7);
        doc.text(student.email, 400, y + 7);
        doc.moveTo(40, y + itemHeight).lineTo(555, y + itemHeight).stroke('#dddddd');
        y += itemHeight;
      });
      doc.moveTo(40, y).lineTo(555, y).stroke('#198754');
      y += 10;
    });

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;