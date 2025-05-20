const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize express app
const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://blog-app-rho-hazel-50.vercel.app', 'https://blog-app-1ntb.onrender.com'],
  credentials: true
}));

app.use(express.json());

// Connect to MongoDB Atlas
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.error('MongoDB Atlas connection error:', err));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// API routes
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/auth', require('./routes/auth'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Any route that doesn't match the above should serve the index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
} else {
  // In development, add a simple route for the root path
  app.get('/', (req, res) => {
    res.send('API is running. Please use the appropriate endpoints.');
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

