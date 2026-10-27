const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "Semester 1"
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Semester', semesterSchema);