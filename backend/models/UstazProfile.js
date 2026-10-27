const mongoose = require('mongoose');

const ustazProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  phone: String, // Make sure this is here
  specialization: [String]
});

module.exports = mongoose.model('UstazProfile', ustazProfileSchema);