const router = require('express').Router();
const Book = require('../models/Book');
const { auth, requireRole } = require('../middleware/auth');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// 1. Configure Multer to use Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = 'muslim_jamaa_covers';
    let resource_type = 'image';
    let format = 'jpg';

    if (file.fieldname === 'file') {
      folder = 'muslim_jamaa_books';
      resource_type = 'raw'; // Required for PDF
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

// 2. Upload Route
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
      filePath: pdfFile.path, // <--- MUST BE .path (Cloudinary URL)
      fileSize: pdfFile.size,
      coverImage: coverFile ? coverFile.path : null, // <--- MUST BE .path (Cloudinary URL)
      uploadedBy: req.user.id
    });
    res.json(book);
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ... (Keep the rest of the routes exactly as they are: GET, download, cover, delete)
// Download Route
router.get('/:id/download', auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    const fullPath = path.join(__dirname, '..', 'uploads', 'books', book.filePath);
    if (!fs.existsSync(fullPath)) return res.status(404).json({ message: 'File missing' });

    book.downloadCount += 1;
    await book.save();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    fs.createReadStream(fullPath).pipe(res);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Cover Image Route
// GET COVER IMAGE
router.get('/:id/cover', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || !book.coverImage) {
      return res.status(404).send('No cover');
    }
    
    // Cloudinary URLs start with 'http'. Redirect to them directly.
    if (book.coverImage.startsWith('http')) {
      return res.redirect(book.coverImage);
    } 
    
    // Fallback for old local images (just in case you have old books)
    res.redirect(`https://muslim-jamaa-api.onrender.com/uploads/books/${book.coverImage}`);
  } catch (err) { 
    res.status(500).send('Server error'); 
  }
});

// Delete Route
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      const pdfPath = path.join(__dirname, '..', 'uploads', 'books', book.filePath);
      const coverPath = book.coverImage ? path.join(__dirname, '..', 'uploads', 'books', book.coverImage) : null;
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      if (coverPath && fs.existsSync(coverPath)) fs.unlinkSync(coverPath);
      await book.deleteOne();
    }
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;