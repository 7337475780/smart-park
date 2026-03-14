// Utility to call our new Node.js backend
export const analyzeParkingImageReq = async (imageFile) => {
  // We use FormData to send a multipart/form-data request
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await fetch('http://localhost:5000/api/analyze-parking', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to analyze parking image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error calling backend analyze-parking API:', error);
    throw error;
  }
};

