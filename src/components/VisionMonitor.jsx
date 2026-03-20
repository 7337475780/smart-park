import React, { useState, useEffect, useRef } from 'react';
import { Camera, Scan, Activity, Info, ShieldCheck, Play, Square, Loader2 } from 'lucide-react';
import { analyzeParkingImageReq } from '../services/gemini';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const VisionMonitor = () => {
    const [imageTimestamp, setImageTimestamp] = useState(Date.now());
    const [isScanning, setIsScanning] = useState(false);
    const [isAutoScanActive, setIsAutoScanActive] = useState(false);
    const [lastScanResult, setLastScanResult] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');
    const [cameraActive, setCameraActive] = useState(false);

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const autoScanIntervalRef = useRef(null);

    // Initial flicker effect
    useEffect(() => {
        setIsScanning(true);
        const timer = setTimeout(() => setIsScanning(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    const [stream, setStream] = useState(null);

    // Sync Stream with Video Element
    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
            // Force play in case autoPlay is blocked
            videoRef.current.play().catch(e => console.log('Auto-play blocked, waiting for user interaction.'));
        }
    }, [stream]);

    // Handle Interval Scan
    useEffect(() => {
        if (isAutoScanActive) {
            autoScanIntervalRef.current = setInterval(performScan, 8000);
        } else {
            if (autoScanIntervalRef.current) clearInterval(autoScanIntervalRef.current);
            autoScanIntervalRef.current = null;
        }
        return () => {
            if (autoScanIntervalRef.current) clearInterval(autoScanIntervalRef.current);
        };
    }, [isAutoScanActive]);

    const toggleAutoScan = async () => {
        if (isAutoScanActive) {
            stopAutoScan();
        } else {
            await startAutoScan();
        }
    };

    const startAutoScan = async () => {
        try {
            setError('');
            const constraints = { 
                video: { 
                    width: { ideal: 1280 }, 
                    height: { ideal: 720 }, 
                    facingMode: { ideal: 'environment' } 
                } 
            };
            const newStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(newStream);
            setIsAutoScanActive(true);
        } catch (err) {
            console.error('Auto-Scan Error:', err);
            alert('Camera access denied or unavailable. Please check permissions.');
        }
    };

    const stopAutoScan = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setIsAutoScanActive(false);
        setIsAnalyzing(false);
        setCameraActive(false);
    };

    const performScan = async () => {
        // We use isAutoScanActive to guard the scan
        if (!videoRef.current || !videoRef.current.srcObject) return;
        
        setIsAnalyzing(true);
        setIsScanning(true);

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            // Sync canvas size
            if (video.videoWidth) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(async (blob) => {
                    if (!blob) return;
                    const file = new File([blob], "auto-scan.jpg", { type: "image/jpeg" });
                    try {
                        const result = await analyzeParkingImageReq(file);
                        setLastScanResult(result);
                        setImageTimestamp(Date.now());
                    } catch (e) {
                        console.error('Auto-Scan Analysis Error:', e);
                    } finally {
                        setIsAnalyzing(false);
                        setTimeout(() => setIsScanning(false), 1000);
                    }
                }, 'image/jpeg', 0.85);
            } else {
                // Video not ready yet
                setIsAnalyzing(false);
                setIsScanning(false);
            }
        } catch (err) {
            setIsAnalyzing(false);
            setIsScanning(false);
        }
    };

    const imageUrl = `${API_BASE}/uploads/latest.jpg?t=${imageTimestamp}`;

    return (
        <div className="vision-monitor-section" style={{ marginBottom: '2rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
                <div className="flex items-center gap-2">
                    <div style={{
                        width: '10px', height: '10px', 
                        background: isAutoScanActive ? '#10b981' : '#ff4444',
                        borderRadius: '50%', 
                        boxShadow: `0 0 10px ${isAutoScanActive ? '#10b981' : '#ff4444'}`,
                        animation: 'pulse 1.5s infinite'
                    }} />
                    <h3 style={{ fontSize: '1.4rem', margin: 0 }}>
                        {isAutoScanActive ? 'AI Auto-Scan Active' : 'AI Vision Feed'}
                    </h3>
                </div>
                <button 
                    className={`btn ${isAutoScanActive ? 'btn-danger' : 'btn-primary'}`}
                    onClick={toggleAutoScan}
                    style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', borderRadius: '8px' }}
                >
                    {isAutoScanActive ? (
                        <><Square size={14} style={{ marginRight: '6px' }} /> Stop Auto-Scan</>
                    ) : (
                        <><Play size={14} style={{ marginRight: '6px' }} /> Start Live AI Scan (8s)</>
                    )}
                </button>
            </div>

            <div className="glass-panel" style={{
                padding: '0.75rem',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.4)',
                minHeight: '300px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                {/* Visual Content Container */}
                <div style={{
                    width: '100%',
                    height: 'auto',
                    minHeight: '300px',
                    borderRadius: '0.75rem',
                    overflow: 'hidden',
                    position: 'relative',
                    background: '#0a0a0f'
                }}>
                    {isAutoScanActive ? (
                        <video 
                            ref={videoRef} autoPlay playsInline muted
                            onCanPlay={(e) => e.target.play()}
                            onPlaying={() => setCameraActive(true)}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 1, display: 'block' }}
                        />
                    ) : (
                        <img
                            src={imageUrl}
                            alt="Latest Camera Capture"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.8, filter: 'contrast(1.1) brightness(0.9) saturate(1.2)' }}
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1200';
                                e.target.style.opacity = 0.3;
                            }}
                        />
                    )}

                    {/* HUD Status Bar */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', 
                        padding: '10px 15px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
                        display: 'flex', justifyContent: 'space-between', zIndex: 10
                    }}>
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.65rem', fontFamily: 'monospace' }}>
                            {isAutoScanActive ? 'WEB_CAM_INPUT::ACTIVE' : 'HARDWARE_NODE::CONNECTED'}<br />
                            STATUS: {isAnalyzing ? 'UPLOADING...' : 'MONITORING'}
                        </div>
                        {isAutoScanActive && (
                            <div className="text-accent flex items-center gap-1" style={{ fontSize: '0.65rem', fontWeight: 'bold' }}>
                                <Loader2 className="animate-spin" size={10} /> LIVE_ANALYTICS
                            </div>
                        )}
                    </div>

                    {/* Target Brackets */}
                    <div style={{ position: 'absolute', top: '10%', left: '10%', width: '40px', height: '40px', borderTop: '2px solid var(--accent-primary)', borderLeft: '2px solid var(--accent-primary)', opacity: 0.5 }} />
                    <div style={{ position: 'absolute', top: '10%', right: '10%', width: '40px', height: '40px', borderTop: '2px solid var(--accent-primary)', borderRight: '2px solid var(--accent-primary)', opacity: 0.5 }} />
                    <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '40px', height: '40px', borderBottom: '2px solid var(--accent-primary)', borderLeft: '2px solid var(--accent-primary)', opacity: 0.5 }} />
                    <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '40px', height: '40px', borderBottom: '2px solid var(--accent-primary)', borderRight: '2px solid var(--accent-primary)', opacity: 0.5 }} />

                    {/* Scanning Laser */}
                    {isScanning && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '3px',
                            background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
                            boxShadow: '0 0 20px var(--accent-primary)',
                            animation: 'scan 2.5s ease-in-out infinite',
                            zIndex: 15
                        }} />
                    )}

                    {/* Result Pop-up (Brief) */}
                    {lastScanResult && isScanning && (
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            background: 'rgba(16, 185, 129, 0.9)', color: 'white', padding: '10px 20px',
                            borderRadius: '99px', fontSize: '0.8rem', fontWeight: 'bold', zIndex: 20,
                            boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)'
                        }}>
                             {lastScanResult.carDetected ? `PROCESSED: ${lastScanResult.licensePlate || 'VEHICLE'}` : 'PROCESSED: EMPTY'}
                        </div>
                    )}

                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </div>
            </div>

            <p className="text-xs text-muted" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Info size={12} /> {isAutoScanActive ? 'Auto-Scan Mode enabled: Capturing and analyzing every 5 seconds via Webcam.' : 'This feed shows the hardware capture. Start Auto-Scan for continuous live AI updates.'}
            </p>

            <style>{`
                @keyframes scan {
                    0% { top: 0% }
                    50% { top: 100% }
                    100% { top: 0% }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default VisionMonitor;
