const router = require('express').Router();
const { auth, requireRole } = require('../middleware/auth');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const UstazProfile = require('../models/UstazProfile');
const Schedule = require('../models/Schedule');
const Semester = require('../models/Semester'); // Import Semester
const Complaint = require('../models/Complaint');
const PDFDocument = require('pdfkit');

router.get('/me', auth, requireRole('student'), async (req, res) => {
  const profile = await StudentProfile.findOne({ user: req.user.id });
  const user = await User.findById(req.user.id).select('-password');
  res.json({ user, profile });
});

router.put('/me', auth, requireRole('student'), async (req, res) => {
  const profile = await StudentProfile.findOneAndUpdate({ user: req.user.id }, req.body, { new: true });
  res.json(profile);
});

router.get('/dashboard', auth, requireRole('student'), async (req, res) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user.id });
    const myKitab = profile?.kitabPreferences || '';

    // 1. Get Schedules (Holds the Ustaz and Semester)
    const schedules = await Schedule.find({ targetKitab: myKitab })
      .populate('ustaz', 'fullName')
      .sort({ sessionDate: 1 });

    // 2. Get Ustaz Info
    let ustazInfo = null;
    if (schedules.length > 0 && schedules[0].ustaz) {
      const ustazProfile = await UstazProfile.findOne({ user: schedules[0].ustaz._id });
      ustazInfo = {
        name: schedules[0].ustaz.fullName,
        phone: ustazProfile ? ustazProfile.phone : 'Not provided'
      };
    }

    // 3. Get Semesters
    const semesters = await Semester.find().sort({ startDate: 1 });

    // 4. Get Complaints
    const complaints = await Complaint.find({ student: req.user.id }).sort({ createdAt: -1 });

    // 5. Get Classmates
    let classmates = [];
    if (myKitab) {
      const allProfiles = await StudentProfile.find({ 
        user: { $ne: req.user.id },
        kitabPreferences: myKitab 
      }).populate('user', 'fullName');
      
      classmates = allProfiles.map(p => ({
        name: p.user?.fullName || 'Unknown'
      }));
    }

    res.json({ ustazInfo, schedules, complaints, classmates, semesters, kitabName: myKitab });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/complaints', auth, requireRole('student'), async (req, res) => {
  try {
    const { title, message } = req.body;
    const complaint = await Complaint.create({ student: req.user.id, title, message });
    res.json(complaint);
  } catch (err) { res.status(500).json({ message: err.message }); }
});
// Excel-Style PDF Generator (Merged Table)
router.get('/my-schedule/pdf', auth, requireRole('student'), async (req, res) => {
  try {
    const student = await User.findById(req.user.id);
    const profile = await StudentProfile.findOne({ user: req.user.id });
    const myKitab = profile?.kitabPreferences || '';
    
    const schedules = await Schedule.find({ targetKitab: myKitab }).populate('ustaz', 'fullName').sort({ sessionDate: 1 });
    const semesters = await Semester.find();
    const classmates = await StudentProfile.find({ user: { $ne: req.user.id }, kitabPreferences: myKitab }).populate('user', 'fullName');
    
    let ustazPhone = 'N/A';
    let ustazName = 'Pending';
    if (schedules.length > 0 && schedules[0].ustaz) {
      ustazName = schedules[0].ustaz.fullName;
      const ustazProf = await UstazProfile.findOne({ user: schedules[0].ustaz._id });
      if (ustazProf) ustazPhone = ustazProf.phone;
    }

    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=my_full_report.pdf');
    doc.pipe(res);

    // --- HEADER ---
    doc.fontSize(20).fillColor('#198754').text("Muslim Jama'aa - Arsi University", { align: 'center' });
    doc.fontSize(14).fillColor('black').text(`Official Student Report`, { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#555').text(`Student: ${student.fullName}  |  Kitab: ${myKitab}  |  Ustaz: ${ustazName}  |  Phone: ${ustazPhone}`, { align: 'center' });
    doc.moveDown(1.5);

    // --- MERGED EXCEL TABLE ---
    const tableTop = doc.y;
    const rowHeight = 40; // Taller rows to fit schedule details
    const colWidths = [70, 70, 80, 160, 135]; // Semester, Kitab, Ustaz, Schedule, Classmates
    const colX = [40, 110, 180, 260, 420];

    // Draw Table Header
    doc.font('Helvetica-Bold').fontSize(9);
    doc.rect(40, tableTop, 515, 25).fillAndStroke('#198754', '#198754');
    doc.fillColor('white');
    doc.text('Semester', colX[0] + 5, tableTop + 8, { width: colWidths[0] - 10, align: 'center' });
    doc.text('Kitab', colX[1] + 5, tableTop + 8, { width: colWidths[1] - 10, align: 'center' });
    doc.text('Ustaz', colX[2] + 5, tableTop + 8, { width: colWidths[2] - 10, align: 'center' });
    doc.text('Class Schedule', colX[3] + 5, tableTop + 8, { width: colWidths[3] - 10, align: 'center' });
    doc.text('Classmates', colX[4] + 5, tableTop + 8, { width: colWidths[4] - 10, align: 'center' });

    let y = tableTop + 25;
    doc.font('Helvetica').fontSize(8).fillColor('black');

    // Draw Table Rows
    if (schedules.length === 0) {
      doc.rect(40, y, 515, 30).stroke('#ccc');
      doc.text('No classes scheduled yet.', 40, y + 10, { width: 515, align: 'center' });
    } else {
      // Calculate total height for the classmates cell based on number of classmates
      const classmatesHeight = Math.max(rowHeight * schedules.length, 30 + (classmates.length * 12));
      
      schedules.forEach((s, index) => {
        const currentRowHeight = (index === 0) ? classmatesHeight : rowHeight;
        
        // Zebra striping
        if (index % 2 === 0) {
          doc.rect(40, y, 515, currentRowHeight).fill('#f8f9fa');
        }
        
        // Draw cell borders
        doc.rect(40, y, 515, currentRowHeight).stroke('#ddd');
        colX.forEach((x, i) => {
          if (i > 0) doc.moveTo(x, y).lineTo(x, y + currentRowHeight).stroke('#ddd');
        });

        doc.fillColor('black');

        // 1. Semester
        const semDetails = semesters.find(sem => sem.name === s.semester);
        doc.font('Helvetica-Bold').text(s.semester, colX[0] + 5, y + 5, { width: colWidths[0] - 10, align: 'center' });
        if (semDetails) {
          doc.font('Helvetica').fontSize(7).fillColor('#666');
          doc.text(`${new Date(semDetails.startDate).toLocaleDateString()}\n${new Date(semDetails.endDate).toLocaleDateString()}`, colX[0] + 5, y + 16, { width: colWidths[0] - 10, align: 'center' });
          doc.fillColor('black').fontSize(8);
        }

        // 2. Kitab
        doc.text(s.targetKitab, colX[1] + 5, y + 5, { width: colWidths[1] - 10, align: 'center' });

        // 3. Ustaz
        doc.font('Helvetica-Bold').fillColor('#198754');
        doc.text(s.ustaz?.fullName || 'Pending', colX[2] + 5, y + 5, { width: colWidths[2] - 10, align: 'center' });
        doc.fillColor('black').font('Helvetica');

        // 4. Schedule Details
        doc.font('Helvetica-Bold').text(s.title, colX[3] + 5, y + 5, { width: colWidths[3] - 10 });
        doc.font('Helvetica').fontSize(7).fillColor('#555');
        doc.text(`Topic: ${s.topic || '-'}`, colX[3] + 5, y + 15, { width: colWidths[3] - 10 });
        doc.text(`Date: ${new Date(s.sessionDate).toLocaleDateString()} at ${s.sessionTime}`, colX[3] + 5, y + 24, { width: colWidths[3] - 10 });
        doc.text(`Loc: ${s.location || '-'}`, colX[3] + 5, y + 33, { width: colWidths[3] - 10 });
        doc.fillColor('black').fontSize(8).font('Helvetica');

        // 5. Classmates (Only draw on the first row, spanning all rows)
        if (index === 0) {
          doc.font('Helvetica-Bold').fontSize(8).text('Students:', colX[4] + 5, y + 5, { width: colWidths[4] - 10 });
          doc.font('Helvetica').fontSize(7).fillColor('#444');
          
          if (classmates.length === 0) {
            doc.text('None yet', colX[4] + 5, y + 15, { width: colWidths[4] - 10 });
          } else {
            let cy = y + 15;
            classmates.forEach(c => {
              doc.text(`• ${c.user?.fullName || 'Unknown'}`, colX[4] + 5, cy, { width: colWidths[4] - 10 });
              cy += 12;
            });
          }
          doc.fillColor('black').fontSize(8).font('Helvetica');
        }

        y += currentRowHeight;
      });
    }

    doc.end();
  } catch (err) { res.status(500).json({ message: err.message }); }
});
module.exports = router;