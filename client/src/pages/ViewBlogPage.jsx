import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import '../styles/ViewBlogPage.css';

const ViewBlogPage = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        // Fix the API endpoint to match the server route
        const res = await api.get(`/blogs/${id}`);
        setBlog(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Failed to load blog. It may have been deleted or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  // Define the handleEditClick function
  const handleEditClick = () => {
    if (blog && blog._id) {
      navigate(`/blogs/edit/${blog._id}`);
    }
  };

  if (loading) {
    return (
      <div className="view-blog-page">
        <Navbar />
        <div className="loading">Loading blog...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="view-blog-page">
        <Navbar />
        <div className="error-container">
          <div className="error-message">{error}</div>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="view-blog-page">
        <Navbar />
        <div className="error-container">
          <div className="error-message">Blog not found</div>
          <button onClick={() => navigate('/dashboard')} className="back-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="view-blog-page">
      <Navbar />
      <div className="blog-container">
        <div className="blog-header">
          <h1 className="blog-title">{blog.title || 'Untitled Blog'}</h1>
          <div className="blog-meta">
            <span className="blog-date">
              {new Date(blog.updatedAt || blog.createdAt).toLocaleDateString()}
            </span>
            <span className={`blog-status ${blog.status}`}>
              {blog.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        
        <div className="blog-content">
          {blog.content || 'No content available.'}
        </div>
        
        {blog.tags && blog.tags.length > 0 && (
          <div className="blog-tags">
            {blog.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        )}
        
        <div className="blog-actions">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            Back to Dashboard
          </button>
          <button 
            onClick={handleEditClick} 
            className="edit-button"
          >
            Edit Blog
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewBlogPage;






