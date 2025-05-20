import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import BlogEditor from '../components/BlogEditor';
import ErrorBoundary from '../components/ErrorBoundary';
import api from '../services/api';
import '../styles/EditBlogPage.css';

const EditBlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState({
    title: '',
    content: '',
    tags: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(id ? true : false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  const isMounted = useRef(true);
  const saveInProgressRef = useRef(false);
  const navigationTimeoutRef = useRef(null);
  
  // Fetch blog data if editing an existing blog
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/blogs/${id}`);
        
        if (isMounted.current) {
          // Format tags as comma-separated string for the editor
          const tagsString = res.data.tags ? res.data.tags.join(', ') : '';
          
          setBlog({
            ...res.data,
            tags: tagsString
          });
          
          // Set last saved time
          if (res.data.updatedAt) {
            setLastSaved(new Date(res.data.updatedAt));
          }
        }
      } catch (err) {
        console.error('Error fetching blog:', err);
        if (isMounted.current) {
          setError('Failed to load blog. It may have been deleted or you may not have permission to edit it.');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };
    
    if (id) {
      fetchBlog();
    }
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }
    };
  }, [id]);
  
  const handleSave = async (blogData) => {
    if (saveInProgressRef.current) {
      console.log('Save already in progress, ignoring duplicate request');
      return;
    }
    
    try {
      setIsSaving(true);
      saveInProgressRef.current = true;
      console.log('Attempting to save blog with data:', blogData);
      
      let response;
      
      if (blogData.status === 'published') {
        // Use the publish endpoint
        console.log('Publishing blog...');
        response = await api.post('/blogs/publish', blogData);
      } else {
        // Use the save draft endpoint
        if (blogData._id) {
          // Update existing blog
          console.log('Updating existing blog...');
          response = await api.post('/blogs/save-draft', blogData);
        } else {
          // Create new blog
          console.log('Creating new blog...');
          response = await api.post('/blogs/save-draft', blogData);
        }
      }
      
      console.log('Save response:', response.data);
      
      if (isMounted.current) {
        if (blogData.status === 'published') {
          toast.success('Blog published successfully');
        } else {
          toast.success(blogData._id ? 'Blog updated successfully' : 'Blog created successfully');
        }
        
        // Update the last saved time
        if (response.data.updatedAt) {
          setLastSaved(new Date(response.data.updatedAt));
        }
        
        // Update the blog data with the response from the server
        setBlog(response.data);
        
        // For manual saves (not auto-saves), navigate back to blogs page
        if (!blogData.isAutoSave) {
          // Add a small delay before redirecting to ensure the toast is visible
          navigationTimeoutRef.current = setTimeout(() => {
            if (isMounted.current) {
              navigate('/blogs');
            }
          }, 1500);
        }
      }
      
      // Return the saved blog data for the auto-save function
      return response.data;
    } catch (error) {
      console.error('Error saving blog:', error);
      if (isMounted.current) {
        toast.error('Failed to save blog. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsSaving(false);
      }
      saveInProgressRef.current = false;
    }
  };
  
  if (loading) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading blog...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="app-container">
      <Navbar />
      <div className="edit-blog-page">
        <div className="page-header">
          <h1>{id ? 'Edit Blog' : 'Create New Blog'}</h1>
          <button 
            className="back-button"
            onClick={() => navigate('/blogs')}
            disabled={isSaving}
          >
            Back to Blogs
          </button>
        </div>
        
        {error ? (
          <div className="error-message">
            {error}
            <button 
              onClick={() => navigate('/blogs')} 
              className="back-button"
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="editor-container">
            <ErrorBoundary fallback={
              <div className="error-message">
                <p>An error occurred while loading the editor.</p>
                <button onClick={() => window.location.reload()} className="retry-button">
                  Reload Page
                </button>
              </div>
            }>
              <BlogEditor 
                initialData={blog} 
                onSave={handleSave} 
                lastSavedTime={lastSaved} 
              />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditBlogPage;






















