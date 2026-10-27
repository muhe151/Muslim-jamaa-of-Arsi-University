const router = require('express').Router();
const News = require('../models/News');
const { auth, requireRole } = require('../middleware/auth');

// Get all news (Public - anyone can see)
router.get('/', async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 }).limit(5); // Show latest 5
  res.json(news);
});

// Admin create news
router.post('/', auth, requireRole('admin'), async (req, res) => {
  const news = await News.create({ 
    title: req.body.title, 
    content: req.body.content,
    postedBy: req.user.id
  });
  res.json(news);
});

// Admin delete news
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  await News.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;