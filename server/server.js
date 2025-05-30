const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://blog-app-rho-hazel-50.vercel.app',
    'blog-app-git-main-hemanthchinnu363-gmailcoms-projects.vercel.app',
    'blog-e1r46s216-hemanthchinnu363-gmailcoms-projects.vercel.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json());

// MongoDB Atlas URI from environment variables
const MONGODB_URI = process.env.MONGO_URI;
console.log('Using MongoDB Atlas URI:', MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://****:****@')); // Log without exposing credentials

// Add this before mongoose.connect()
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
console.log('MongoDB URI defined:', !!mongoUri);

// Connect to MongoDB
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Atlas connected'))
  .catch(err => console.error('MongoDB Atlas connection error:', err));

// Routes
const blogRoutes = require('./routes/blogs');
app.use('/api/blogs', blogRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});










