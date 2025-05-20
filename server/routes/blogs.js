const express = require('express');
const router = express.Router();
const blogsController = require('../controllers/blogsController');
const auth = require('../middleware/auth');

// Public routes
router.get('/public', blogsController.getPublishedBlogs);
router.get('/public/:id', blogsController.getPublishedBlogById);

// Protected routes - require authentication
router.use(auth);

// Get all blogs for the authenticated user
router.get('/', blogsController.getAllBlogs);

// Get a single blog by ID
router.get('/:id', blogsController.getBlogById);

// Create a new blog
router.post('/', blogsController.createBlog);

// Auto-save a blog
router.post('/auto-save', auth, async (req, res) => {
  try {
    console.log('Auto-save request received:', req.body);
    const { _id, title, content, tags, status } = req.body;
    const Blog = require('../models/Blog');
    
    let blog;
    
    if (_id) {
      // Update existing blog
      blog = await Blog.findById(_id);
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      // Check if user is authorized to update this blog
      if (blog.author.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this blog' });
      }
      
      // Update the blog
      blog.title = title;
      blog.content = content;
      blog.tags = tags;
      blog.status = status;
      blog.updatedAt = new Date(); // Ensure updatedAt is set to current time
      
      await blog.save();
    } else {
      // Create new blog
      blog = new Blog({
        title,
        content,
        tags,
        status,
        author: req.user.id
      });
      
      await blog.save();
    }
    
    // Return the updated blog with timestamp
    res.json({
      _id: blog._id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags,
      status: blog.status,
      updatedAt: blog.updatedAt
    });
  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({ message: 'Server error during auto-save' });
  }
});

// Save a blog as draft
router.post('/save-draft', auth, async (req, res) => {
  try {
    console.log('Save draft request received:', req.body);
    const Blog = require('../models/Blog');
    
    const { _id, title, content, tags } = req.body;
    
    let blog;
    
    if (_id) {
      // Update existing blog
      blog = await Blog.findById(_id);
      
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      // Check if user is authorized to update this blog
      if (blog.author.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to update this blog' });
      }
      
      // Update the blog
      blog.title = title;
      blog.content = content;
      blog.tags = tags;
      blog.updatedAt = new Date(); // Ensure updatedAt is set to current time
      
      await blog.save();
    } else {
      // Create new blog
      blog = new Blog({
        title,
        content,
        tags,
        status: 'draft',
        author: req.user.id
      });
      
      await blog.save();
    }
    
    // Return the complete blog data
    res.json({
      _id: blog._id,
      title: blog.title,
      content: blog.content,
      tags: blog.tags,
      status: blog.status,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ message: 'Server error during save' });
  }
});

// Publish a blog
router.post('/publish', auth, async (req, res) => {
  try {
    console.log('Publish request received:', req.body);
    
    const { _id, title, content, tags } = req.body;
    const Blog = require('../models/Blog');
    
    // If blog exists, update it
    if (_id) {
      const blog = await Blog.findById(_id);
      
      if (!blog) {
        console.log('Blog not found with ID:', _id);
        return res.status(404).json({ message: 'Blog not found' });
      }
      
      // Check if the blog belongs to the authenticated user
      if (blog.author.toString() !== req.user.id) {
        console.log('Unauthorized publish attempt. Blog author:', blog.author, 'User:', req.user.id);
        return res.status(403).json({ message: 'Not authorized to publish this blog' });
      }
      
      // Update the blog
      blog.title = title;
      blog.content = content;
      blog.tags = tags;
      blog.status = 'published';
      blog.updatedAt = new Date(); // Explicitly set the updatedAt timestamp
      
      const updatedBlog = await blog.save();
      console.log('Blog published successfully:', updatedBlog);
      return res.json(updatedBlog);
    }
    
    // If blog doesn't exist, create a new one and publish it
    const newBlog = new Blog({
      title,
      content,
      tags,
      status: 'published',
      author: req.user.id
    });
    
    const blog = await newBlog.save();
    console.log('New blog published successfully:', blog);
    res.json(blog);
  } catch (err) {
    console.error('Error publishing blog:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a blog
router.put('/:id', blogsController.updateBlog);

// Delete a blog
router.delete('/:id', blogsController.deleteBlog);

module.exports = router;













