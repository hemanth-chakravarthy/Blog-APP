import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { formatDate, truncateString, stringToColor } from '../utils/helpers';
import '../styles/BlogsPage.css';

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'draft'
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchCategory, setSearchCategory] = useState('all');
  const [publishingBlogId, setPublishingBlogId] = useState(null);
  
  // Get location to detect navigation events
  const location = useLocation();
  
  // Create a debounced function for search
  const debouncedSearch = useRef(
    debounce((term) => {
      setDebouncedSearchTerm(term);
    }, 300)
  ).current;
  
  // Update debounced search term when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);
  
  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs');
      console.log('Fetched blogs:', response.data);
      setBlogs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Fetch blogs on initial load and when navigating back to this page
  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs, location.key]); // location.key changes when navigating
  
  useEffect(() => {
    console.log('Current blogs state:', blogs);
    console.log('Blogs by status:', {
      all: blogs.length,
      published: blogs.filter(b => b.status === 'published').length,
      draft: blogs.filter(b => b.status === 'draft').length
    });
  }, [blogs]);
  
  // Handle blog deletion
  const handleDelete = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }
    
    try {
      await api.delete(`/blogs/${blogId}`);
      toast.success('Blog deleted successfully');
      // Refresh the blogs list
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      toast.error('Failed to delete blog. Please try again.');
    }
  };
  
  // Handle blog publishing
  const handlePublish = async (blogId) => {
    if (!window.confirm('Are you sure you want to publish this blog?')) {
      return;
    }
    
    try {
      setPublishingBlogId(blogId);
      
      // Find the blog to publish
      const blogToPublish = blogs.find(blog => blog._id === blogId);
      if (!blogToPublish) {
        toast.error('Blog not found');
        return;
      }
      
      // Check if blog is already published
      if (blogToPublish.status === 'published') {
        toast.info('This blog is already published');
        setPublishingBlogId(null);
        return;
      }
      
      // Update the blog status to published
      const updatedBlog = {
        ...blogToPublish,
        status: 'published'
      };
      
      console.log('Publishing blog:', updatedBlog);
      
      // Send the update to the server
      await api.put(`/blogs/${blogId}`, updatedBlog);
      
      // Update the local state
      setBlogs(prevBlogs => 
        prevBlogs.map(blog => 
          blog._id === blogId ? {...blog, status: 'published'} : blog
        )
      );
      
      toast.success('Blog published successfully');
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('Error publishing blog:', err);
      if (err.response?.data?.message === 'Blog is already published') {
        toast.info('This blog is already published');
      } else {
        toast.error('Failed to publish blog. Please try again.');
      }
    } finally {
      setPublishingBlogId(null);
    }
  };
  
  // Filter blogs based on status, search term, and search category
  const filteredBlogs = blogs.filter(blog => {
    // Filter by status
    if (filter !== 'all' && blog.status !== filter) {
      return false;
    }
    
    // If no search term, return all blogs that match the status filter
    if (debouncedSearchTerm.trim() === '') {
      return true;
    }
    
    const term = debouncedSearchTerm.toLowerCase();
    
    // Filter by search category
    switch (searchCategory) {
      case 'title':
        return blog.title.toLowerCase().includes(term);
      case 'content':
        return blog.content.toLowerCase().includes(term);
      case 'tags':
        return blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(term));
      case 'all':
      default:
        return (
          blog.title.toLowerCase().includes(term) ||
          blog.content.toLowerCase().includes(term) ||
          (blog.tags && blog.tags.some(tag => tag.toLowerCase().includes(term)))
        );
    }
  });
  
  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blogs...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <Navbar />
      <div className="blogs-page">
        <header className="blogs-header">
          <h1>My Blogs</h1>
          <Link to="/blogs/new" className="new-blog-button">
            Create New Blog
          </Link>
        </header>
        
        <div className="blogs-filters">
          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <div className="search-category-selector">
                <select 
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="search-category-dropdown"
                >
                  <option value="all">All Fields</option>
                  <option value="title">Title</option>
                  <option value="content">Content</option>
                  <option value="tags">Tags</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="filter-buttons">
            <button 
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button 
              className={`filter-button ${filter === 'published' ? 'active' : ''}`}
              onClick={() => setFilter('published')}
            >
              Published
            </button>
            <button 
              className={`filter-button ${filter === 'draft' ? 'active' : ''}`}
              onClick={() => setFilter('draft')}
            >
              Drafts
            </button>
          </div>
        </div>
        
        {error && (
          <div className="error-message blogs-error">
            {error}
            <button onClick={fetchBlogs} className="retry-button">
              Retry
            </button>
          </div>
        )}
        
        {!error && filteredBlogs.length === 0 && (
          <div className="no-blogs-message">
            {searchTerm ? (
              <p>No blogs found matching your search.</p>
            ) : filter !== 'all' ? (
              <p>No {filter} blogs found. <Link to="/blogs/new">Create one?</Link></p>
            ) : (
              <div className="empty-state">
                <p>You haven't created any blogs yet.</p>
                <Link to="/blogs/new" className="create-first-blog">
                  Create Your First Blog
                </Link>
              </div>
            )}
          </div>
        )}
        
        {debouncedSearchTerm && (
          <div className="search-results-info">
            Found <span className="search-results-count">{filteredBlogs.length}</span> result(s) for "{debouncedSearchTerm}" in {searchCategory === 'all' ? 'all fields' : searchCategory}
            <button 
              className="clear-search"
              onClick={() => {
                setSearchTerm('');
                setSearchCategory('all');
              }}
            >
              Clear search
            </button>
          </div>
        )}
        
        <div className="blogs-grid">
          {filteredBlogs.map(blog => (
            <div key={blog._id} className="blog-card">
              <div className="blog-status">
                <span className={`status-badge ${blog.status}`}>
                  {blog.status === 'published' ? 'Published' : 'Draft'}
                </span>
                <span className="blog-date">{formatDate(blog.updatedAt || blog.createdAt)}</span>
              </div>
              
              <h2 className="blog-title">{blog.title || 'Untitled Blog'}</h2>
              
              <div className="blog-content-preview">
                {truncateString(blog.content, 150) || 'No content yet...'}
              </div>
              
              {blog.tags && blog.tags.length > 0 && (
                <div className="blog-tags">
                  {blog.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="tag"
                      style={{ backgroundColor: `${stringToColor(tag)}20`, color: stringToColor(tag) }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="blog-actions">
                <Link to={`/blogs/${blog._id}`} className="view-btn">View</Link>
                <Link to={`/blogs/edit/${blog._id}`} className="edit-btn">Edit</Link>
                {blog.status === 'draft' && (
                  <button 
                    onClick={() => handlePublish(blog._id)} 
                    className={`publish-btn ${publishingBlogId === blog._id ? 'publishing' : ''}`}
                    disabled={publishingBlogId !== null}
                  >
                    {publishingBlogId === blog._id ? 'Publishing...' : 'Publish'}
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(blog._id)} 
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogsPage;























