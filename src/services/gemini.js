// Utility to call our Node.js backend for Vision / OCR Analysis
// The backend supports both /api/analyze-parking and /api/analyze (alias)
export const analyzeParkingImageReq = async (imageFile) => {
  // We use FormData to send a multipart/form-data request
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log(`Analyzing image via: ${API_BASE}/api/analyze-parking`);
    
    const response = await fetch(`${API_BASE}/api/analyze-parking`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = 'Failed to analyze parking image';
      try {
        const errorData = await response.json();
        errorMsg = errorData.details ? `${errorData.error}: ${errorData.details}` : (errorData.error || errorMsg);
      } catch (e) {
        // Fallback if response is not JSON
        errorMsg = `Server Error: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (error) {
    console.error('AI Vision Service Error:', error);
    throw error;
  }
};
