import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import api from '../services/api';
import '../styles/DashboardPage.css';

const DashboardPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [publishingBlogId, setPublishingBlogId] = useState(null);
  // Removed unused AuthContext and useContext

  const fetchBlogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/blogs');
      console.log('Fetched blogs:', res.data);
      setBlogs(res.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs. Please try again later.');
      toast.error('Failed to load blogs. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleDelete = async (id) => {
    if (deleteInProgress) {
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        setDeleteInProgress(true);
        console.log(`Attempting to delete blog with ID: ${id}`);
        
        const response = await api.delete(`/blogs/${id}`);
        console.log('Delete response:', response);
        
        // Update the state to remove the deleted blog
        setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== id));
        
        // Show success message using a timeout to avoid React state update conflicts
        setTimeout(() => {
          toast.success('Blog deleted successfully');
        }, 100);
      } catch (err) {
        console.error('Error deleting blog:', err);
        setTimeout(() => {
          toast.error('Failed to delete blog. Please try again.');
        }, 100);
      } finally {
        setDeleteInProgress(false);
      }
    }
  };

  // Handle blog publishing
  const handlePublish = async (id) => {
    if (window.confirm('Are you sure you want to publish this blog?')) {
      try {
        setPublishingBlogId(id);
        console.log(`Attempting to publish blog with ID: ${id}`);
        
        // Find the blog to publish
        const blogToPublish = blogs.find(blog => blog._id === id);
        if (!blogToPublish) {
          toast.error('Blog not found');
          return;
        }
        
        // Update the blog status to published
        const updatedBlog = {
          ...blogToPublish,
          status: 'published'
        };
        
        // Send the update to the server
        const response = await api.put(`/blogs/${id}`, updatedBlog);
        console.log('Publish response:', response);
        
        // Update the state to reflect the published status
        setBlogs(prevBlogs => 
          prevBlogs.map(blog => 
            blog._id === id ? {...blog, status: 'published'} : blog
          )
        );
        
        // Show success message
        setTimeout(() => {
          toast.success('Blog published successfully');
        }, 100);
      } catch (err) {
        console.error('Error publishing blog:', err);
        setTimeout(() => {
          toast.error('Failed to publish blog. Please try again.');
        }, 100);
      } finally {
        setPublishingBlogId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <div className="loading">Loading blogs...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>My Blogs</h1>
          <Link to="/blogs/new" className="new-blog-btn">Create New Blog</Link>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={fetchBlogs} className="retry-button">
              Retry
            </button>
          </div>
        )}

        {!error && blogs.length === 0 ? (
          <div className="no-blogs">
            <p>You haven't created any blogs yet.</p>
            <Link to="/blogs/new" className="create-first-blog">Create your first blog</Link>
          </div>
        ) : (
          <div className="blogs-list">
            {blogs.map(blog => (
              <div key={blog._id} className="blog-card">
                <div className="blog-info">
                  <h2 className="blog-title">{blog.title || 'Untitled Blog'}</h2>
                  <p className="blog-status">Status: {blog.status}</p>
                  <p className="blog-date">Last updated: {new Date(blog.updatedAt || blog.createdAt).toLocaleDateString()}</p>
                </div>
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
                    disabled={deleteInProgress}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
















