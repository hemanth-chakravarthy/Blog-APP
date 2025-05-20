const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required'],
    minlength: [10, 'Content should be at least 10 characters long']
  },
  tags: {
    type: [String],
    validate: {
      validator: function(tags) {
        // Ensure each tag is not too long
        return tags.every(tag => tag.length <= 20);
      },
      message: 'Each tag must be 20 characters or less'
    },
    default: []
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published'],
      message: '{VALUE} is not a valid status'
    },
    default: 'draft'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Blog', BlogSchema);

