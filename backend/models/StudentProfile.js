const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: String,
  region: String,
  zone: String,
  city: String,
  islamicEducationStatus: {
    type: String,
    enum: ['none', 'madrasa', 'hifz', 'alim'],
    default: 'none'
  },
  quranLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'hafiz'],
    default: 'beginner'
  },
  kitabPreferences: [String],
  enrollmentDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);