// Helper functions for working with Blob objects
export const createBlobFromData = (data, options = {}) => {
  try {
    if (typeof Blob === 'undefined') {
      throw new Error('Blob is not supported in this environment');
    }
    
    return new Blob([data], options);
  } catch (error) {
    console.error('Error creating Blob:', error);
    throw error;
  }
};

export const downloadBlob = (blob, filename) => {
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Error downloading Blob:', error);
    throw error;
  }
};