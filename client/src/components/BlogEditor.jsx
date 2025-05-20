import React, { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import PublishConfirmation from './PublishConfirmation';
import '../styles/BlogEditor.css';

// Define the BlogEditor component
const BlogEditor = ({ initialData, onSave, lastSavedTime }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    status: 'draft',
    ...initialData // Spread initialData to override defaults
  });
  
  // Update formData when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: '',
        content: '',
        tags: '',
        status: 'draft',
        ...initialData
      });
    }
  }, [initialData]);
  
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState(lastSavedTime);
  const [showPublishConfirmation, setShowPublishConfirmation] = useState(false);
  
  const isMounted = useRef(true);
  const saveInProgressRef = useRef(false);
  const debouncedSaveRef = useRef(null);
  
  // Update lastSaved when lastSavedTime changes
  useEffect(() => {
    setLastSaved(lastSavedTime);
  }, [lastSavedTime]);
  
  // Setup auto-save functionality
  useEffect(() => {
    const debouncedSave = debounce(async (data) => {
      // Don't auto-save if there's already a save in progress
      if (saveInProgressRef.current || !data.title.trim()) {
        return;
      }
      
      try {
        saveInProgressRef.current = true;
        
        // Process tags
        const processedTags = data.tags
          ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
          : [];
        
        const blogData = {
          ...data,
          tags: processedTags,
          status: 'draft',
          isAutoSave: true // Flag to indicate this is an auto-save
        };
        
        console.log('Auto-saving blog:', blogData);
        
        // Call the onSave prop with the blog data
        const savedBlog = await onSave(blogData);
        
        if (isMounted.current) {
          // Update the last saved time with the current time
          setLastSaved(new Date());
          
          toast.info('Draft saved automatically', {
            autoClose: 2000,
            position: 'bottom-right',
            className: 'auto-save-toast'
          });
        }
      } catch (error) {
        console.error('Auto-save error:', error);
      } finally {
        saveInProgressRef.current = false;
      }
    }, 30000); // 30 seconds delay for auto-save
    
    debouncedSaveRef.current = debouncedSave;
    
    // Cleanup function
    return () => {
      debouncedSave.cancel();
    };
  }, [onSave]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (debouncedSaveRef.current) {
        debouncedSaveRef.current.cancel();
      }
    };
  }, []);
  
  const validateForm = (status) => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (status === 'published' && !formData.content.trim()) {
      newErrors.content = 'Content is required for publishing';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle manual save
  const handleSave = async (status) => {
    if (isSaving || isPublishing || isSubmitting) {
      return;
    }
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Process tags
      const processedTags = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
        : [];
      
      const blogData = {
        ...formData,
        tags: processedTags,
        status,
        isAutoSave: false // Flag to indicate this is a manual save
      };
      
      await onSave(blogData);
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishClick = () => {
    // Show confirmation dialog before publishing
    setShowPublishConfirmation(true);
  };

  const handlePublishConfirm = async () => {
    console.log('Publishing blog...');
    // Explicitly set the status to 'published' in the formData before saving
    setFormData(prevData => ({
      ...prevData,
      status: 'published'
    }));
    await handleSave('published');
    setShowPublishConfirmation(false);
  };

  const handlePublishCancel = () => {
    setShowPublishConfirmation(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Trigger debounced auto-save when user changes content
    if (debouncedSaveRef.current) {
      debouncedSaveRef.current({
        ...formData,
        [name]: value
      });
    }
  };

  return (
    <div className="blog-editor">
      {showPublishConfirmation && (
        <PublishConfirmation
          onConfirm={handlePublishConfirm}
          onCancel={handlePublishCancel}
          isPublishing={isPublishing}
        />
      )}
      
      {lastSaved && (
        <div className="last-saved">
          Last saved: {lastSaved.toLocaleTimeString()}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter blog title"
          className={errors.title ? 'error' : ''}
        />
        {errors.title && <div className="error-text">{errors.title}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          placeholder="Write your blog content here..."
          rows="15"
          className={errors.content ? 'error' : ''}
        />
        {errors.content && <div className="error-text">{errors.content}</div>}
      </div>
      
      <div className="form-group">
        <label htmlFor="tags">Tags (comma separated)</label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          placeholder="e.g. technology, programming, web development"
        />
      </div>
      
      <div className="editor-footer">
        {lastSaved && (
          <div className="last-saved-info">
            Last saved: {new Date(lastSaved).toLocaleTimeString()}
          </div>
        )}
        <div className="editor-actions">
          <button 
            className="btn btn-save"
            onClick={() => handleSave('draft')}
            disabled={isSaving || isPublishing || isSubmitting}
          >
            {isSaving ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            className="publish-button"
            onClick={handlePublishClick}
            disabled={isPublishing || isSaving || isSubmitting}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;














