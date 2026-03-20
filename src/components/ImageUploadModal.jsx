import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Loader2, RefreshCw, StopCircle } from 'lucide-react';
import { analyzeParkingImageReq } from '../services/gemini';

const ImageUploadModal = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('upload'); // 'upload' or 'webcam'
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Handle Camera Lifecycle via Effect
  useEffect(() => {
    if (mode === 'webcam') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const startCamera = async () => {
    try {
      setError('');
      setCameraActive(false);
      
      const constraints = {
        video: { 
          width: { ideal: 1280 }, 
          height: { ideal: 720 },
          facingMode: { ideal: 'environment' } // Prefer back camera, but allow fallback
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Status update happens via onPlaying event on the video tag
      }
    } catch (err) {
      console.error('Camera Error:', err);
      setError('Camera Access Failed: Please ensure browser permissions are granted and no other app is using the camera.');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => {
        track.stop();
        // console.log('Track stopped:', track.label); // Disabling spammy log
      });
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      const capturedFile = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
      setFile(capturedFile);
      setMode('upload'); // Switch back to 'upload' mode so we see the captured preview
      // Stop camera after capture to save resources
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

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
    if (mode === 'upload') fileInputRef.current.click();
  };

  const toggleMode = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 120
    }}>
      <div className="glass-panel modal-panel" style={{ width: '100%', maxWidth: '600px', padding: '2.5rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '800' }}>
            <Camera className="text-accent" size={28} /> AI Vision Capture
          </h2>
          <button onClick={() => { stopCamera(); onClose(); }} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={28} />
          </button>
        </div>

        {/* Mode Toggles */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '12px' }}>
          <button 
            className={`btn ${mode === 'upload' ? 'btn-primary' : ''}`} 
            style={{ flex: 1, height: '40px', fontSize: '0.85rem' }} 
            onClick={() => toggleMode('upload')}
          >
            <Upload size={14} style={{ marginRight: '6px' }} /> Upload Photo
          </button>
          <button 
            className={`btn ${mode === 'webcam' ? 'btn-primary' : ''}`} 
            style={{ flex: 1, height: '40px', fontSize: '0.85rem' }} 
            onClick={() => toggleMode('webcam')}
          >
            <Camera size={14} style={{ marginRight: '6px' }} /> Live Camera
          </button>
        </div>

        <form onSubmit={handleUpload}>
          <div className="form-group">
            <div
              onClick={onContainerClick}
              className={`upload-dropzone ${isAnalyzing ? 'cyber-border-neon' : ''}`}
              style={{
                border: '2px dashed var(--glass-border)',
                borderRadius: '1rem',
                height: '320px',
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.4)',
                cursor: mode === 'upload' ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              {mode === 'webcam' ? (
                <>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    onPlaying={() => setCameraActive(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: cameraActive ? 'block' : 'none' }} 
                  />
                  {!cameraActive && (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-accent" size={40} />
                      <p className="text-sm text-secondary">Initializing Hardware Stream...</p>
                    </div>
                  )}
                  {cameraActive && (
                    <div style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                        <button type="button" onClick={capturePhoto} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '99px', boxShadow: '0 0 20px var(--accent-glow)' }}>
                            <Camera size={18} style={{ marginRight: '8px' }} /> CAPTURE FRAME
                        </button>
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                </>
              ) : (
                <>
                  {file ? (
                    <div style={{ padding: '1rem' }}>
                         <img src={URL.createObjectURL(file)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', border: '1px solid var(--accent-primary)' }} />
                         <p className="text-xs text-accent" style={{ marginTop: '10px' }}>{file.name} - Ready for Analysis</p>
                         <button type="button" className="text-xs text-muted" onClick={(e) => { e.stopPropagation(); setFile(null); }} style={{ background: 'none', border: 'none', marginTop: '5px', textDecoration: 'underline', cursor: 'pointer' }}>Change Image</button>
                    </div>
                  ) : (
                    <>
                      <Upload size={48} className="text-muted" style={{ marginBottom: '1rem' }} />
                      <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Drag & Drop or Click to Browse</div>
                      <div className="text-xs text-muted">Supports High-Res JPG/PNG for better OCR</div>
                    </>
                  )}
                </>
              )}

              {/* Scanning Laser Line */}
              {isAnalyzing && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
                  background: 'linear-gradient(90deg, transparent, #fff, transparent)',
                  boxShadow: '0 0 20px #fff',
                  zIndex: 20,
                  animation: 'scan 1.5s ease-in-out infinite'
                }} />
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files[0])}
            style={{ display: 'none' }}
          />

          {error && <div style={{ color: '#ff4444', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button type="button" className="btn" style={{ flex: 1 }} onClick={() => { stopCamera(); onClose(); }} disabled={isAnalyzing}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={isAnalyzing || !file}>
              {isAnalyzing ? <><RefreshCw className="animate-spin" size={18} style={{ marginRight: '8px' }} /> AI Scan Pipeline Active...</> : 'Analyze Parking Image'}
            </button>
          </div>
        </form>

        {result && (
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <h4 style={{ color: 'var(--status-available)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StopCircle size={18} /> Deep Logic Analysis Success
            </h4>
            <div className="text-sm grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}><strong>Detection:</strong> {result.carDetected ? 'Vehicle Present' : 'Empty Slot'}</div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}><strong>Plate:</strong> {result.licensePlate || 'N/A'}</div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}><strong>Verdict:</strong> {result.parkingStatus.toUpperCase()}</div>
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px' }}><strong>Updated Slot:</strong> {result.suggestedSlotId || 'N/A'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Global styles already define animations from before, but let's ensure 'scan' exists
if (typeof document !== 'undefined' && !document.getElementById('ai-vision-styles')) {
  const style = document.createElement('style');
  style.id = 'ai-vision-styles';
  style.textContent = `
    @keyframes scan {
      0% { top: 0%; opacity: 0.3; }
      50% { top: 100%; opacity: 1; }
      100% { top: 0%; opacity: 0.3; }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default ImageUploadModal;
