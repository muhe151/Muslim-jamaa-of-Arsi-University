const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: String,
  region: String,
  zone: String,
  city: String,
  campus: { type: String, enum: ['Ardu Campus', 'Dinsho Campus', 'Bokoji Campus', 'Health Campus'], default: 'Ardu Campus' },
  department: { type: String, default: 'Not Specified' }, // <--- NEW
  year: { type: String, default: '1st Year' }, // <--- NEW
  islamicEducationStatus: { type: String, enum: ['none','Basic','Good','Alim'], default: 'none' },
  quranLevel: { type: String, enum: ['beginner','intermediate','hafiz'], default: 'beginner' },
  kitabPreferences: { type: String, default: 'None' },
  enrollmentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);