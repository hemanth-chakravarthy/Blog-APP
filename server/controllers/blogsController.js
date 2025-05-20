const Blog = require('../models/Blog');

// Get all blogs for the authenticated user
exports.getAllBlogs = async (req, res) => {
  try {
    console.log('Getting all blogs for user:', req.user.id);
    // Find all blogs for the user, regardless of status
    const blogs = await Blog.find({ author: req.user.id }).sort({ updatedAt: -1 });
    console.log(`Found ${blogs.length} blogs with statuses:`, blogs.map(b => b.status));
    res.json(blogs);
  } catch (err) {
    console.error('Error in getAllBlogs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single blog by ID
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if the blog belongs to the authenticated user
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to access this blog' });
    }
    
    res.json(blog);
  } catch (err) {
    console.error('Error in getBlogById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new blog
exports.createBlog = async (req, res) => {
  try {
    const { title, content, tags, status } = req.body;
    
    // Create a new blog
    const newBlog = new Blog({
      title,
      content,
      tags,
      status: status || 'draft', // Default to draft if status is not provided
      author: req.user.id
    });
    
    // Save the blog
    await newBlog.save();
    
    res.status(201).json(newBlog);
  } catch (err) {
    console.error('Error in createBlog:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a blog
exports.updateBlog = async (req, res) => {
  try {
    console.log('Update blog request received:', req.params.id, req.body);
    const { id } = req.params;
    const { title, content, tags, status } = req.body;
    
    // Find the blog
    const blog = await Blog.findById(id);
    
    // Check if blog exists
    if (!blog) {
      console.log('Blog not found:', id);
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if user is the author
    if (blog.author.toString() !== req.user.id) {
      console.log('Unauthorized update attempt. Blog author:', blog.author, 'User:', req.user.id);
      return res.status(403).json({ message: 'Not authorized to update this blog' });
    }
    
    // Prevent publishing a blog that's already published
    if (status === 'published' && blog.status === 'published') {
      return res.status(400).json({ message: 'Blog is already published' });
    }
    
    // Update the blog
    blog.title = title;
    blog.content = content;
    blog.tags = tags;
    
    // Only update status if it's provided
    if (status) {
      console.log('Updating blog status to:', status);
      blog.status = status;
    }
    
    blog.updatedAt = new Date(); // Explicitly set the updatedAt timestamp
    
    // Save the updated blog
    const updatedBlog = await blog.save();
    console.log('Blog updated successfully:', updatedBlog);
    
    res.json(updatedBlog);
  } catch (err) {
    console.error('Error in updateBlog:', err);
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a blog
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    // Check if the blog belongs to the authenticated user
    if (blog.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this blog' });
    }
    
    // Use deleteOne instead of remove (which is deprecated)
    await Blog.deleteOne({ _id: req.params.id });
    res.json({ message: 'Blog removed' });
  } catch (err) {
    console.error('Error in deleteBlog:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all published blogs (public)
exports.getPublishedBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find({ status: 'published' })
      .sort({ updatedAt: -1 })
      .populate('author', 'name');
    
    res.json(blogs);
  } catch (err) {
    console.error('Error in getPublishedBlogs:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a single published blog by ID (public)
exports.getPublishedBlogById = async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      _id: req.params.id,
      status: 'published'
    }).populate('author', 'name');
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    
    res.json(blog);
  } catch (err) {
    console.error('Error in getPublishedBlogById:', err);
    res.status(500).json({ message: 'Server error' });
  }
};






