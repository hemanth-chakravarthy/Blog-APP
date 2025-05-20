import React from 'react';
import '../styles/PublishConfirmation.css';

const PublishConfirmation = ({ onConfirm, onCancel, isPublishing }) => {
  return (
    <div className="publish-confirmation-overlay">
      <div className="publish-confirmation-modal">
        <h2>Publish Blog</h2>
        <p>
          Are you sure you want to publish this blog? Published blogs will be visible to all users.
          <br /><br />
          <strong>Note:</strong> Once published, your blog will appear in the public feed and can be viewed by anyone.
        </p>
        
        <div className="confirmation-actions">
          <button 
            className="cancel-button"
            onClick={onCancel}
            disabled={isPublishing}
          >
            Cancel
          </button>
          <button 
            className="confirm-button"
            onClick={onConfirm}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <span className="loading-spinner"></span>
                Publishing...
              </>
            ) : (
              'Publish'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublishConfirmation;



