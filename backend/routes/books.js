const router = require('express').Router();
const Book = require('../models/Book');
const { auth, requireRole } = require('../middleware/auth');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// 1. Use memoryStorage to hold the file in RAM temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder, resource_type) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder, resource_type: resource_type },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// 2. Get all books
router.get('/', auth, async (req, res) => {
  try {
    const books = await Book.find().sort({ uploadedAt: -1 });
    res.json(books);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 3. Upload Book
router.post('/', auth, requireRole('admin'), upload.fields([{ name: 'file', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    if (!req.files || !req.files['file']) {
      return res.status(400).json({ message: 'PDF file required' });
    }

    const pdfFile = req.files['file'][0];
    const coverFile = req.files['cover'] ? req.files['cover'][0] : null;

    // Upload PDF to Cloudinary
    const pdfResult = await uploadToCloudinary(pdfFile.buffer, 'muslim_jamaa_books', 'raw');
    
    // Upload Cover to Cloudinary (if it exists)
    let coverResult = null;
    if (coverFile) {
      coverResult = await uploadToCloudinary(coverFile.buffer, 'muslim_jamaa_covers', 'image');
    }

    // Save to Database
    const book = await Book.create({
      title: req.body.title,
      author: req.body.author,
      category: req.body.category,
      filePath: pdfResult.secure_url, // Full Cloudinary URL
      fileSize: pdfResult.bytes,
      coverImage: coverResult ? coverResult.secure_url : null, // Full Cloudinary URL
      uploadedBy: req.user.id
    });
    
    res.json(book);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    // Send full error details to frontend
    res.status(500).json({ message: err.message || 'Upload failed', error: err });
  }
});

// 4. Download PDF
router.get('/:id/download', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.downloadCount += 1;
    await book.save();

    // Force download from Cloudinary
    const downloadUrl = book.filePath.replace('/upload/', '/upload/fl_attachment/');
    res.redirect(downloadUrl);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. Get Cover Image
router.get('/:id/cover', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || !book.coverImage) return res.status(404).send('No cover');
    res.redirect(book.coverImage);
  } catch (err) { res.status(500).send('Server error'); }
});

// 6. Delete Book
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) await book.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;