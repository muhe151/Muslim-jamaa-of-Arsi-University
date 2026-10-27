const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const { auth, requireRole } = require('../middleware/auth');
const multer = require('multer');

// Configure multer to accept files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'books');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.get('/', auth, async (req, res) => {
  const books = await Book.find().sort({ uploadedAt: -1 });
  res.json(books);
});

// Accept BOTH 'file' (PDF) and 'cover' (Image)
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
      filePath: pdfFile.filename,
      fileSize: pdfFile.size,
      coverImage: coverFile ? coverFile.filename : null, // Saves image name
      uploadedBy: req.user.id
    });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/download', auth, async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  const fullPath = path.join(__dirname, '..', 'uploads', 'books', book.filePath);
  if (!fs.existsSync(fullPath)) return res.status(404).json({ message: 'File missing' });

  book.downloadCount += 1;
  await book.save();

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
  fs.createReadStream(fullPath).pipe(res);
});

// Public route to display the image
router.get('/:id/cover', async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book || !book.coverImage) return res.status(404).send('No cover');
  const fullPath = path.join(__dirname, '..', 'uploads', 'books', book.coverImage);
  if (!fs.existsSync(fullPath)) return res.status(404).send('File missing');
  res.sendFile(fullPath);
});

router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book) {
    const pdfPath = path.join(__dirname, '..', 'uploads', 'books', book.filePath);
    const coverPath = book.coverImage ? path.join(__dirname, '..', 'uploads', 'books', book.coverImage) : null;
    if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    if (coverPath && fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
    await book.deleteOne();
  }
  res.json({ message: 'Deleted' });
});

module.exports = router;