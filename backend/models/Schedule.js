const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  title: String,
  semester: { type: String, enum: ['Semester 1', 'Semester 2'], default: 'Semester 1' },
  targetKitab: { type: String, required: true }, // <--- NEW: Links to a specific Kitab
  sessionDate: Date,
  sessionTime: String,
  topic: String,
  location: String,
  ustaz: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Schedule', scheduleSchema);