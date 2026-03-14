import React, { useState } from 'react';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { analyzeParkingImageReq } from '../services/gemini';

const ImageUploadModal = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const fileInputRef = React.useRef(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setError('');
      setResult(null);

      const analysisData = await analyzeParkingImageReq(file);
      setResult(analysisData);

    } catch (err) {
      setError(err.message || 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onContainerClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera className="text-accent" /> Smart Parking AI
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
          Upload a photo of the parking lot. Smart Parking AI will analyze it on the server and update the Live Dashboard automatically.
        </p>

        <form onSubmit={handleUpload}>
          <div className="form-group">
            <div
              onClick={onContainerClick}
              className={`upload-dropzone ${isAnalyzing ? 'cyber-border-neon' : ''}`}
              style={{
                border: '2px dashed var(--glass-border)',
                borderRadius: '0.75rem',
                padding: '3rem 2rem',
                textAlign: 'center',
                backgroundColor: 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Scanning Laser Line */}
              {isAnalyzing && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
                  boxShadow: '0 0 15px var(--accent-primary)',
                  zIndex: 10,
                  animation: 'scan 2s ease-in-out infinite'
                }} />
              )}

              <Upload size={40} className={isAnalyzing ? 'text-accent' : 'text-muted'} style={{ margin: '0 auto 1.5rem auto' }} />
              <div style={{ fontWeight: '500', color: file ? 'var(--status-available)' : 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {file ? file.name : 'Click to Browse or Drag Photo'}
              </div>
              <div className="text-xs text-muted">{isAnalyzing ? 'AI Scanning Frame...' : 'Supports JPG, PNG (Max 5MB)'}</div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {error && <div style={{ color: 'var(--status-occupied)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn" style={{ flex: 1 }} onClick={onClose} disabled={isAnalyzing}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={isAnalyzing || !file}>
              {isAnalyzing ? <><Loader2 className="animate-spin" size={18} style={{ marginRight: '8px' }} /> Processing in Cloud...</> : 'Analyze Image'}
            </button>
          </div>
        </form>

        {result && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <h4 style={{ color: 'var(--status-available)', marginBottom: '0.5rem' }}>Analysis Complete</h4>
            <div className="text-sm grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div><strong>Car Detected:</strong> {result.carDetected ? 'Yes' : 'No'}</div>
              <div><strong>License Plate:</strong> {result.licensePlate || 'N/A'}</div>
              <div><strong>Parking Status:</strong> {result.parkingStatus}</div>
              <div><strong>Slot ID Updated:</strong> {result.suggestedSlotId || 'N/A'}</div>
            </div>
            <p className="text-xs text-muted" style={{ marginTop: '0.75rem' }}>The database has been updated. Close this window to see changes on the grid.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Simple rotation animation for the loader
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes scan {
    0% { top: 0%; opacity: 0.5; }
    50% { top: 100%; opacity: 1; }
    100% { top: 0%; opacity: 0.5; }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  .upload-dropzone:hover {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-color: var(--accent-primary) !important;
    transform: translateY(-2px);
  }
`;
document.head.appendChild(style);

export default ImageUploadModal;
