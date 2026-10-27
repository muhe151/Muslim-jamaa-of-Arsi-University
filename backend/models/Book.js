const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: String,
  category: String,
  filePath: { type: String, required: true },
  fileSize: Number,
  coverImage: { type: String }, // <--- This must be here
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  uploadedAt: { type: Date, default: Date.now },
  downloadCount: { type: Number, default: 0 }
});

module.exports = mongoose.model('Book', bookSchema);