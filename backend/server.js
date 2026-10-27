require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/ustaz', require('./routes/ustaz'));
app.use('/api/books', require('./routes/books'));
app.use('/api/schedule', require('./routes/schedule'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/semesters', require('./routes/semesters'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/news', require('./routes/news'));

app.get('/', (req, res) => res.json({ message: 'Muslim Jama\'aa API running' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on http://localhost:${PORT}`));