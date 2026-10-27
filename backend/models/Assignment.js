const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  ustaz: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  kitabName: { type: String, required: true },
  assignedDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'completed'], default: 'active' }
});

module.exports = mongoose.model('Assignment', assignmentSchema);