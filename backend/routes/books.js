const router = require('express').Router();
const Book = require('../models/Book');
const { auth, requireRole } = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'muslim_jamaa_covers';
    let resource_type = 'image';
    let format = 'jpg';

    if (file.fieldname === 'file') {
      folder = 'muslim_jamaa_books';
      resource_type = 'raw'; 
      format = 'pdf';
    }

    return {
      folder: folder,
      resource_type: resource_type,
      format: format,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`
    };
  },
});

const upload = multer({ storage: storage });

// THIS IS THE ROUTE THAT IS MISSING (THE 404 ERROR)
router.get('/', auth, async (req, res) => {
  try {
    const books = await Book.find().sort({ uploadedAt: -1 });
    res.json(books);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, requireRole('admin'), upload.fields([{ name: 'file', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    if (!req.files || !req.files['file']) {
      return res.status(400).json({ message: 'PDF file required' });
    }

    const pdfFile = req.files['file'][0];
    const coverFile = req.files['cover'] ? req.files['cover'][0] : null;

    const book = await Book.create({
      title: req.body.title,
      author: req.body.author,
      category: req.body.category,
      filePath: pdfFile.path, 
      fileSize: pdfFile.size,
      coverImage: coverFile ? coverFile.path : null, 
      uploadedBy: req.user.id
    });
    res.json(book);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/download', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    book.downloadCount += 1;
    await book.save();

    const downloadUrl = book.filePath.replace('/upload/', '/upload/fl_attachment/');
    res.redirect(downloadUrl);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id/cover', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || !book.coverImage) return res.status(404).send('No cover');
    res.redirect(book.coverImage);
  } catch (err) { res.status(500).send('Server error'); }
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) await book.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;